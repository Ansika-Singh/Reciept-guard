import os
import re
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.config import settings
from app.database import SessionLocal
from app.models.db_models import Receipt, ReceiptItem, StorePolicy, PolicySection, CalculationResult

class BaseVectorStore:
    def index_receipt_items(
        self,
        shopper_id: str,
        receipt_id: str,
        store: str,
        purchase_date: str,
        items: List[Dict[str, Any]]
    ):
        raise NotImplementedError

    def index_policy_sections(self, store_name: str, sections: List[Dict[str, Any]]):
        raise NotImplementedError

    def query_similar(
        self,
        shopper_id: str,
        query_text: str,
        n_results: int = 5
    ) -> Dict[str, Any]:
        raise NotImplementedError

    def query_policies(
        self,
        query_text: str,
        store_name: Optional[str] = None,
        n_results: int = 3
    ) -> List[Dict[str, Any]]:
        raise NotImplementedError


class ProductionVectorStore(BaseVectorStore):
    """
    Lightweight, serverless-ready deterministic database retrieval engine.
    Requires ZERO heavy vector libraries (e.g. no ChromaDB, no ONNX, no PyTorch).
    Guarantees strict shopper isolation and fast keyword/token relevance scoring directly from SQLite or PostgreSQL.
    """
    def index_receipt_items(
        self,
        shopper_id: str,
        receipt_id: str,
        store: str,
        purchase_date: str,
        items: List[Dict[str, Any]]
    ):
        # Database records are permanently persisted in relational tables (Receipt, ReceiptItem, CalculationResult)
        return True

    def index_policy_sections(self, store_name: str, sections: List[Dict[str, Any]]):
        # Policy records are permanently persisted in relational tables (StorePolicy, PolicySection)
        return True

    def query_similar(
        self,
        shopper_id: str,
        query_text: str,
        n_results: int = 5
    ) -> Dict[str, Any]:
        db: Session = SessionLocal()
        try:
            # Query items belonging strictly to this shopper
            query = (
                db.query(ReceiptItem, Receipt, CalculationResult)
                .join(Receipt, ReceiptItem.receipt_id == Receipt.receipt_id)
                .outerjoin(CalculationResult, ReceiptItem.item_id == CalculationResult.item_id)
                .filter(Receipt.shopper_id == shopper_id)
                .filter(Receipt.is_archived == False)
            )

            results = query.all()
            if not results:
                return {"documents": [[]], "metadatas": [[]], "distances": [[]]}

            # Score each item based on token overlap with query
            tokens = [t.lower() for t in re.findall(r"\w+", query_text) if len(t) > 2]
            scored_items = []

            for item, receipt, calc in results:
                text_corpus = f"{item.name} {item.category or ''} {item.description or ''} {receipt.store} {receipt.invoice_number or ''}".lower()
                
                # Base score: number of matching tokens
                score = sum(2 if token in item.name.lower() else 1 for token in tokens if token in text_corpus)
                if not tokens:
                    score = 1  # Return all if no specific keywords

                doc_text = (
                    f"Item: {item.name} | Store: {receipt.store} | "
                    f"Category: {item.category} | Price: ₹{item.total_price} | "
                    f"Date: {receipt.purchase_date}"
                )
                if calc:
                    doc_text += f" | Return Deadline: {calc.return_deadline} ({calc.return_days_remaining}d left)"
                    if calc.warranty_deadline:
                        doc_text += f" | Warranty: {calc.warranty_deadline}"

                meta = {
                    "item_id": item.item_id,
                    "receipt_id": receipt.receipt_id,
                    "store": receipt.store,
                    "purchase_date": receipt.purchase_date,
                    "shopper_id": shopper_id,
                    "item_name": item.name,
                    "category": item.category or "General",
                    "price": float(item.total_price or 0.0),
                    "return_deadline": calc.return_deadline if calc else None,
                    "return_days_remaining": calc.return_days_remaining if calc else None
                }
                scored_items.append((score, doc_text, meta))

            # Sort descending by score
            scored_items.sort(key=lambda x: x[0], reverse=True)
            top_k = scored_items[:n_results]

            docs = [item[1] for item in top_k]
            metas = [item[2] for item in top_k]
            distances = [max(0.01, 1.0 - (item[0] * 0.2)) for item in top_k]

            return {
                "documents": [docs],
                "metadatas": [metas],
                "distances": [distances]
            }
        finally:
            db.close()

    def query_policies(
        self,
        query_text: str,
        store_name: Optional[str] = None,
        n_results: int = 3
    ) -> List[Dict[str, Any]]:
        db: Session = SessionLocal()
        try:
            query = db.query(PolicySection, StorePolicy).join(
                StorePolicy, PolicySection.policy_id == StorePolicy.policy_id
            )
            if store_name:
                query = query.filter(StorePolicy.store.ilike(f"%{store_name.strip()}%"))

            sections = query.all()
            if not sections:
                return []

            tokens = [t.lower() for t in re.findall(r"\w+", query_text) if len(t) > 2]
            scored = []

            for sec, pol in sections:
                corpus = f"{sec.title} {sec.category} {sec.condition_text} {sec.full_text} {pol.store}".lower()
                score = sum(1 for t in tokens if t in corpus)
                
                scored.append((score, {
                    "section_id": sec.section_id,
                    "store": pol.store,
                    "section_code": sec.section_code,
                    "title": sec.title,
                    "category": sec.category,
                    "policy_type": sec.policy_type,
                    "days_allowed": sec.days_allowed,
                    "condition_text": sec.condition_text,
                    "full_text": sec.full_text
                }))

            scored.sort(key=lambda x: x[0], reverse=True)
            return [item[1] for item in scored[:n_results]]
        finally:
            db.close()


class LocalChromaVectorStore(BaseVectorStore):
    """
    ChromaDB-backed local vector store.
    Lazy-loads ChromaDB to ensure zero footprint in environments where Chroma is not installed.
    """
    def __init__(self):
        self.persist_dir = settings.CHROMA_PERSIST_DIR
        try:
            os.makedirs(self.persist_dir, exist_ok=True)
        except Exception:
            pass
        self._client = None

    @property
    def client(self):
        if self._client is None:
            import chromadb
            self._client = chromadb.PersistentClient(path=self.persist_dir)
        return self._client

    def _get_collection_name(self, shopper_id: str) -> str:
        clean_id = "".join(c if c.isalnum() else "_" for c in shopper_id)
        return f"shopper_{clean_id}"

    def index_receipt_items(
        self,
        shopper_id: str,
        receipt_id: str,
        store: str,
        purchase_date: str,
        items: List[Dict[str, Any]]
    ):
        try:
            col = self.client.get_or_create_collection(name=self._get_collection_name(shopper_id))
            docs = []
            metas = []
            ids = []

            for idx, it in enumerate(items):
                item_name = it.get("name") or it.get("description") or "Unknown Item"
                category = it.get("category") or "General"
                price = it.get("total_price") or it.get("price") or 0.0
                doc_text = f"Item: {item_name} | Store: {store} | Category: {category} | Price: ₹{price} | Date: {purchase_date}"
                
                item_uid = it.get("item_id") or f"{receipt_id}_item_{idx}"
                docs.append(doc_text)
                metas.append({
                    "receipt_id": receipt_id,
                    "store": store,
                    "purchase_date": purchase_date,
                    "shopper_id": shopper_id,
                    "item_name": item_name,
                    "category": category,
                    "price": float(price)
                })
                ids.append(item_uid)

            if docs:
                col.upsert(documents=docs, metadatas=metas, ids=ids)
        except Exception as e:
            print(f"Chroma index notice: {e}")

    def index_policy_sections(self, store_name: str, sections: List[Dict[str, Any]]):
        try:
            col = self.client.get_or_create_collection(name="store_policies_global")
            docs = []
            metas = []
            ids = []
            for sec in sections:
                sec_id = sec.get("section_id") or f"{store_name}_{sec.get('section_code')}"
                docs.append(sec.get("full_text") or sec.get("condition_text") or "")
                metas.append({
                    "store": store_name,
                    "section_code": sec.get("section_code", ""),
                    "category": sec.get("category", "General"),
                    "days_allowed": int(sec.get("days_allowed", 30))
                })
                ids.append(sec_id)
            if docs:
                col.upsert(documents=docs, metadatas=metas, ids=ids)
        except Exception as e:
            print(f"Chroma policy index notice: {e}")

    def query_similar(
        self,
        shopper_id: str,
        query_text: str,
        n_results: int = 5
    ) -> Dict[str, Any]:
        try:
            col = self.client.get_or_create_collection(name=self._get_collection_name(shopper_id))
            count = col.count()
            if count == 0:
                return {"documents": [[]], "metadatas": [[]], "distances": [[]]}
            return col.query(query_texts=[query_text], n_results=min(n_results, count))
        except Exception as e:
            # Fallback to database search if Chroma fails
            return ProductionVectorStore().query_similar(shopper_id, query_text, n_results)

    def query_policies(
        self,
        query_text: str,
        store_name: Optional[str] = None,
        n_results: int = 3
    ) -> List[Dict[str, Any]]:
        # Fall back to database query for guaranteed reliable structured policies
        return ProductionVectorStore().query_policies(query_text, store_name, n_results)


def get_vector_store() -> BaseVectorStore:
    """
    Factory resolving the vector store provider.
    Automatically uses ProductionVectorStore on Vercel or when Chroma is absent.
    """
    if not settings.IS_SERVERLESS and os.getenv("VECTOR_STORE_PROVIDER") == "chroma":
        try:
            import chromadb
            return LocalChromaVectorStore()
        except ImportError:
            pass
            
    return ProductionVectorStore()

vector_store = get_vector_store()
