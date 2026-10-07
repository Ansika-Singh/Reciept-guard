from typing import List, Dict, Any, Optional
from app.services.vector_store import vector_store

class ChromaService:
    """
    Transparent compatibility wrapper around the active VectorStore provider.
    Ensures existing code calling chroma_service maintains complete functionality without importing chromadb.
    """
    def index_receipt_items(
        self,
        shopper_id: str,
        receipt_id: str,
        store: str,
        purchase_date: str,
        items: List[Dict[str, Any]]
    ):
        return vector_store.index_receipt_items(
            shopper_id=shopper_id,
            receipt_id=receipt_id,
            store=store,
            purchase_date=purchase_date,
            items=items
        )

    def index_policy_sections(self, store_name: str = "", sections: List[Dict[str, Any]] = None, **kwargs):
        final_store = store_name or kwargs.get("store", "")
        return vector_store.index_policy_sections(store_name=final_store, sections=sections or [])

    def query_similar(
        self,
        shopper_id: str,
        query_text: str,
        n_results: int = 5
    ) -> Dict[str, Any]:
        return vector_store.query_similar(shopper_id=shopper_id, query_text=query_text, n_results=n_results)

    def query_policies(
        self,
        query_text: str,
        store_name: Optional[str] = None,
        n_results: int = 3
    ) -> List[Dict[str, Any]]:
        return vector_store.query_policies(query_text=query_text, store_name=store_name, n_results=n_results)

    def query_policy_documents(
        self,
        store: Optional[str] = None,
        query: str = "",
        store_name: Optional[str] = None,
        query_text: str = "",
        n_results: int = 3,
        **kwargs
    ) -> List[Dict[str, Any]]:
        s_name = store_name or store or kwargs.get("store_name") or kwargs.get("store")
        q = query_text or query or kwargs.get("query_text") or kwargs.get("query") or ""
        return self.query_policies(query_text=q, store_name=s_name, n_results=n_results)

chroma_service = ChromaService()
