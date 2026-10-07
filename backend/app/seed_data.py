import os
import shutil
import hashlib
from datetime import datetime, date
from sqlalchemy.orm import Session

from app.config import settings
from app.database import Base, engine, SessionLocal, init_db
from app.models.db_models import (
    Shopper,
    StorePolicy,
    PolicySection,
    Order,
    Receipt,
    ReceiptItem,
    ReceiptInvoiceSection,
    CalculationResult,
    AuditLog
)
from app.services.calculator import calculate_item_deadlines, ItemCalculationInput
from app.services.policy_service import get_policy_for_item
from app.services.chroma_service import chroma_service
from app.services.storage_service import compute_file_hash, get_media_type, get_file_type_category
from app.services.receipt_service import get_canonical_receipt_data

CANONICAL_DOCS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "canonical_documents")

def seed_database(db: Session = None):
    close_session = False
    init_db()
    if db is None:
        db = SessionLocal()
        close_session = True

    try:
        # 1. Create Shoppers
        shopper_ids = ["demo-shopper-001", "shopper-001"]
        for s_id in shopper_ids:
            existing = db.query(Shopper).filter_by(shopper_id=s_id).first()
            if not existing:
                shopper = Shopper(
                    shopper_id=s_id,
                    name="Raj Soni",
                    email="raj.soni@example.com"
                )
                db.add(shopper)
        db.flush()

        # 2. Authentic Store Policies
        policies_data = [
            {
                "policy_id": "policy-amazon-in",
                "store": "Amazon.in",
                "title": "Amazon.in Returns and Replacement Policy",
                "effective_date": "2023-01-01",
                "sections": [
                    {
                        "section_id": "sec-amz-1.1",
                        "section_code": "§1.1",
                        "title": "Books & Printed Publications",
                        "category": "Books",
                        "policy_type": "return",
                        "days_allowed": 7,
                        "condition_text": "Must be in original unsoiled condition with intact pages.",
                        "full_text": "§1.1 Books: Eligible for return or replacement within 7 days of delivery if damaged, defective, or different from description."
                    },
                    {
                        "section_id": "sec-amz-1.2",
                        "section_code": "§1.2",
                        "title": "Computer Gaming & Peripherals Replacement",
                        "category": "Electronics",
                        "policy_type": "return",
                        "days_allowed": 7,
                        "condition_text": "7 Days Replacement through Brand Service Center for defective hardware.",
                        "full_text": "§1.2 Electronics & Peripherals: Keyboards and gaming hardware are eligible for 7-day brand replacement for manufacturing defects."
                    },
                    {
                        "section_id": "sec-amz-1.3",
                        "section_code": "§1.3",
                        "title": "Manufacturer Hardware Warranty",
                        "category": "Electronics",
                        "policy_type": "warranty",
                        "days_allowed": 365,
                        "condition_text": "1-Year Official Brand Hardware Warranty covering mechanical and electrical defects.",
                        "full_text": "§1.3 Manufacturer Hardware Warranty: 365 days coverage on genuine electronic keyboards, hall effect switches, and components."
                    },
                    {
                        "section_id": "sec-amz-1.4",
                        "section_code": "§1.4",
                        "title": "General Retail Returns",
                        "category": "All",
                        "policy_type": "return",
                        "days_allowed": 30,
                        "condition_text": "Original packaging and invoice required.",
                        "full_text": "§1.4 General Returns: Unopened general consumer merchandise may be returned within 30 days of purchase."
                    }
                ]
            },
            {
                "policy_id": "policy-caffix",
                "store": "Caffix - The Tech Cafe",
                "title": "Caffix Cafe Food & Beverage Terms",
                "effective_date": "2026-01-01",
                "sections": [
                    {
                        "section_id": "sec-caffix-1.1",
                        "section_code": "§1.1",
                        "title": "Perishable Cafe Consumables",
                        "category": "Food & Beverage",
                        "policy_type": "return",
                        "days_allowed": 0,
                        "condition_text": "Fresh cafe orders and beverages are non-returnable once prepared. Discrepancies resolved immediately at counter.",
                        "full_text": "§1.1 Cafe Consumables: Fresh food, shakes, and brewed beverages are non-returnable upon service. In case of quality issues, immediate replacement is provided at the counter."
                    }
                ]
            },
            {
                "policy_id": "policy-mangalam",
                "store": "Mangalam Designer Pvt. Ltd.",
                "title": "Mangalam Designer Ethnic Wear Exchange Policy",
                "effective_date": "2026-01-01",
                "sections": [
                    {
                        "section_id": "sec-mangalam-1.1",
                        "section_code": "§1.1",
                        "title": "Sarees & Ethnic Wear Exchange",
                        "category": "Clothing",
                        "policy_type": "return",
                        "days_allowed": 7,
                        "condition_text": "Exchange within 7 days with original cash bill and unremoved barcode/price tag.",
                        "full_text": "§1.1 Ethnic Wear Exchange: Sarees may be exchanged within 7 days of purchase in original condition with intact tags and bill."
                    },
                    {
                        "section_id": "sec-mangalam-1.2",
                        "section_code": "§1.2",
                        "title": "Sale & Discount Merchandise Terms",
                        "category": "Clothing",
                        "policy_type": "condition",
                        "days_allowed": 0,
                        "condition_text": "Discounted merchandise (50% sale) is strictly exchange-only; no cash refunds.",
                        "full_text": "§1.2 Discount Sales: Items purchased on discount or promotional schemes are not eligible for cash refunds. Exchange only."
                    },
                    {
                        "section_id": "sec-mangalam-1.3",
                        "section_code": "§1.3",
                        "title": "Fabric Color & Shrinkage Disclaimer",
                        "category": "All",
                        "policy_type": "condition",
                        "days_allowed": 0,
                        "condition_text": "No guarantee for color cloth, zari, shrinkage & durability.",
                        "full_text": "§1.3 Fabric Disclaimer: No guarantee for color cloth, zari, shrinkage & durability as printed on tax invoice."
                    }
                ]
            }
        ]

        for p_info in policies_data:
            existing_pol = db.query(StorePolicy).filter_by(store=p_info["store"]).first()
            if not existing_pol:
                pol = StorePolicy(
                    policy_id=p_info["policy_id"],
                    store=p_info["store"],
                    title=p_info["title"],
                    effective_date=p_info["effective_date"]
                )
                db.add(pol)
                db.flush()

                for s_data in p_info["sections"]:
                    sec = PolicySection(
                        section_id=s_data["section_id"],
                        policy_id=pol.policy_id,
                        section_code=s_data["section_code"],
                        title=s_data["title"],
                        category=s_data["category"],
                        policy_type=s_data["policy_type"],
                        days_allowed=s_data["days_allowed"],
                        condition_text=s_data["condition_text"],
                        full_text=s_data["full_text"]
                    )
                    db.add(sec)
                db.flush()

                # Index into Chroma global store policies
                try:
                    chroma_service.index_policy_sections(p_info["store"], p_info["sections"])
                except Exception as e:
                    print(f"Policy chroma index notice: {e}")

        # 3. Authentic Orders
        orders_data = [
            {
                "order_id": "407-5019440-7312335",
                "shopper_id": "demo-shopper-001",
                "status": "Delivered",
                "tracking_number": "DEL-AMZ-7312335",
                "carrier": "Amazon Logistics / Delhivery",
                "estimated_delivery": "2023-04-11",
                "last_updated": datetime(2023, 4, 11, 14, 30)
            },
            {
                "order_id": "405-0187084-9011564",
                "shopper_id": "demo-shopper-001",
                "status": "Delivered",
                "tracking_number": "DEL-AMZ-9011564",
                "carrier": "Amazon Logistics",
                "estimated_delivery": "2026-08-27",
                "last_updated": datetime(2026, 8, 27, 16, 45)
            },
            {
                "order_id": "SALE-2026",
                "shopper_id": "demo-shopper-001",
                "status": "Delivered",
                "tracking_number": "IN-STORE-01569",
                "carrier": "Store Handover",
                "estimated_delivery": "2026-07-25",
                "last_updated": datetime(2026, 7, 25, 12, 10)
            },
            {
                "order_id": "ORD-1001",
                "shopper_id": "demo-shopper-001",
                "status": "Delivered",
                "tracking_number": "TRK123456987",
                "carrier": "FedEx",
                "estimated_delivery": "2026-09-12",
                "last_updated": datetime(2026, 9, 12, 11, 20)
            },
            {
                "order_id": "ORD-1002",
                "shopper_id": "demo-shopper-001",
                "status": "Shipped",
                "tracking_number": "TRK987654321",
                "carrier": "UPS Ground",
                "estimated_delivery": "2026-09-22",
                "last_updated": datetime(2026, 9, 18, 9, 0)
            }
        ]

        for ord_dict in orders_data:
            existing_ord = db.query(Order).filter_by(order_id=ord_dict["order_id"]).first()
            if not existing_ord:
                db.add(Order(**ord_dict))
        db.flush()

        # 4. Pre-seed 4 Authentic Saved Receipts into Persistent Vault & Database
        canonical_seed_files = [
            ("rich_dad_poor_dad", "rich_dad_poor_dad.jpg", "Rich_Dad_Poor_Dad_Amazon_Invoice.jpg"),
            ("caffix_tech_cafe", "caffix_tech_cafe.jpg", "Caffix_Tech_Cafe_Bill_75636.jpg"),
            ("mangalam_designer", "mangalam_designer.jpg", "Mangalam_Designer_Invoice_01569.jpg"),
            ("kreo_hive_75", "kreo_hive_75.pdf", "Kreo_Hive_75_Amazon_Invoice.pdf")
        ]

        ref_date = date(2026, 9, 20)

        for doc_key, src_filename, display_filename in canonical_seed_files:
            src_file_path = os.path.join(CANONICAL_DOCS_DIR, src_filename)
            if not os.path.exists(src_file_path):
                print(f"Warning: canonical source file '{src_file_path}' not found, skipping.")
                continue

            with open(src_file_path, "rb") as f:
                f_bytes = f.read()
            f_hash = hashlib.sha256(f_bytes).hexdigest()
            f_size = len(f_bytes)

            data = get_canonical_receipt_data(doc_key)

            # Check if already seeded for demo-shopper-001
            existing_receipt = db.query(Receipt).filter(
                Receipt.shopper_id == "demo-shopper-001",
                Receipt.file_hash == f_hash
            ).first()

            if existing_receipt:
                continue

            receipt_id = f"rcpt-{doc_key.replace('_', '-')}"

            # Copy file to persistent vault
            shopper_vault_dir = os.path.join(settings.VAULT_DIR, "demo-shopper-001")
            os.makedirs(shopper_vault_dir, exist_ok=True)
            vault_filename = f"receipt_{receipt_id[:8]}_{display_filename}"
            permanent_vault_path = os.path.join(shopper_vault_dir, vault_filename)
            if os.path.exists(src_file_path):
                try:
                    shutil.copy2(src_file_path, permanent_vault_path)
                except Exception as copy_err:
                    print(f"Vault seed copy notice: {copy_err}")

            storage_key = f"demo-shopper-001/{vault_filename}"
            mime_type = get_media_type(display_filename)
            file_type = get_file_type_category(display_filename)

            # Create Receipt Record
            receipt = Receipt(
                receipt_id=receipt_id,
                shopper_id="demo-shopper-001",
                store=data["store_name"],
                store_address=data.get("store_address"),
                seller_name=data.get("seller_name"),
                buyer_name=data.get("buyer_name"),
                sale_id=data.get("sale_id"),
                invoice_number=data.get("invoice_number"),
                order_id=data.get("order_id"),
                purchase_date=data["purchase_date"],
                purchase_time=data.get("purchase_time"),
                customer_name=data.get("customer_name"),
                payment_method=data.get("payment_method"),
                currency=data.get("currency", "₹"),
                subtotal=data.get("subtotal"),
                discount_total=data.get("discount_total"),
                tax_total=data.get("tax_total"),
                shipping_charges=data.get("shipping_charges"),
                grand_total=data.get("grand_total"),
                amount_in_words=data.get("amount_in_words"),
                printed_return_policy=data.get("printed_return_policy"),
                warranty_information=data.get("warranty_information"),
                filename=display_filename,
                original_filename=display_filename,
                storage_key=storage_key,
                file_type=file_type,
                mime_type=mime_type,
                file_size=f_size,
                file_hash=f_hash,
                raw_text=data.get("raw_text"),
                ocr_confidence=1.0,
                extraction_method="native_pdf" if file_type == "pdf" else "image_ocr",
                validation_status="Verified Math",
                status="CONFIRMED",
                extraction_status="COMPLETED",
                verification_status="VERIFIED",
                is_archived=False,
                confirmed_at=datetime.utcnow()
            )
            db.add(receipt)
            db.flush()

            # Create Invoice Sections
            if "invoice_sections" in data:
                for sec in data["invoice_sections"]:
                    db_sec = ReceiptInvoiceSection(
                        receipt_id=receipt_id,
                        page_number=sec.get("page_number", 1),
                        section_type=sec.get("section_type", "product_invoice"),
                        seller_name=sec.get("seller_name"),
                        invoice_number=sec.get("invoice_number"),
                        invoice_date=sec.get("invoice_date"),
                        subtotal=sec.get("subtotal"),
                        tax_total=sec.get("tax_total"),
                        grand_total=sec.get("grand_total"),
                        notes=sec.get("notes")
                    )
                    db.add(db_sec)
                db.flush()

            # Create Items & Calculations
            items_for_chroma = []
            for it in data["items"]:
                item_id = f"{receipt_id}-{len(items_for_chroma)+1}"
                db_item = ReceiptItem(
                    item_id=item_id,
                    receipt_id=receipt_id,
                    name=it["name"],
                    description=it.get("description"),
                    sku=it.get("sku"),
                    asin=it.get("asin"),
                    item_code=it.get("item_code"),
                    hsn=it.get("hsn"),
                    category=it["category"],
                    quantity=it.get("quantity", 1),
                    unit_price=it.get("unit_price"),
                    discount=it.get("discount"),
                    discount_percent=it.get("discount_percent"),
                    discount_amount=it.get("discount_amount"),
                    tax=it.get("tax"),
                    tax_rate=it.get("tax_rate"),
                    tax_type=it.get("tax_type"),
                    tax_amount=it.get("tax_amount"),
                    price=it.get("total_price") or it["price"],
                    total_price=it.get("total_price") or it["price"],
                    serial_number=it.get("serial_number"),
                    warranty_information=it.get("warranty_information"),
                    warranty_days_if_explicit=it.get("warranty_days_if_explicit")
                )
                db.add(db_item)
                db.flush()

                # Calculator
                policy_sec = get_policy_for_item(db, store_name=receipt.store, category=db_item.category, policy_type="return")
                ret_days = policy_sec.days_allowed if policy_sec else 30
                sec_code = policy_sec.section_code if policy_sec else "§StorePolicy"
                cond_text = policy_sec.condition_text if policy_sec else None

                warr_days = db_item.warranty_days_if_explicit
                if not warr_days and db_item.category.lower() == "electronics":
                    w_sec = get_policy_for_item(db, store_name=receipt.store, category="Electronics", policy_type="warranty")
                    if w_sec:
                        warr_days = w_sec.days_allowed

                calc_in = ItemCalculationInput(
                    item_id=db_item.item_id,
                    item_name=db_item.name,
                    category=db_item.category,
                    price=db_item.price,
                    purchase_date=receipt.purchase_date,
                    policy_store=receipt.store,
                    return_days=ret_days,
                    warranty_days=warr_days,
                    policy_section_code=sec_code,
                    policy_condition=cond_text
                )
                calc_out = calculate_item_deadlines(calc_in, as_of_date=ref_date)

                calc_record = CalculationResult(
                    receipt_id=receipt_id,
                    item_id=db_item.item_id,
                    purchase_date=calc_out.purchase_date,
                    return_deadline=calc_out.return_deadline,
                    return_days_remaining=calc_out.return_days_remaining,
                    warranty_deadline=calc_out.warranty_deadline,
                    warranty_days_remaining=calc_out.warranty_days_remaining,
                    expiring_soon=calc_out.expiring_soon,
                    status_label=calc_out.status_label,
                    applicable_policy_section=calc_out.applicable_policy_section,
                    explanation=calc_out.explanation
                )
                db.add(calc_record)

                items_for_chroma.append({
                    "item_id": db_item.item_id,
                    "name": db_item.name,
                    "category": db_item.category,
                    "price": db_item.price,
                    "serial_number": db_item.serial_number,
                    "warranty_days_if_explicit": db_item.warranty_days_if_explicit
                })

            # Audit Logs
            audit_events = [
                ("UPLOAD", f"File uploaded: {display_filename} ({file_type.upper()})"),
                ("EXTRACTION", f"Verified structured extraction completed ({len(data['items'])} line items)"),
                ("CONFIRMATION", f"Receipt confirmed & saved to vault: {receipt.store} (Total: ₹{receipt.grand_total})"),
                ("VAULT_STORED", f"Original document permanently secured in Receipt Vault (Key: {storage_key})")
            ]
            for stage, msg in audit_events:
                audit = AuditLog(
                    shopper_id="demo-shopper-001",
                    receipt_id=receipt_id,
                    stage=stage,
                    message=msg,
                    timestamp=datetime.utcnow()
                )
                db.add(audit)

            # Chroma Indexing
            try:
                chroma_service.index_receipt_items(
                    shopper_id="demo-shopper-001",
                    receipt_id=receipt_id,
                    store=receipt.store,
                    purchase_date=receipt.purchase_date,
                    items=items_for_chroma
                )
            except Exception as e:
                print(f"Receipt Chroma index notice: {e}")

        db.commit()
        print("Authentic canonical dataset and policies successfully seeded.")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        if close_session:
            db.close()

if __name__ == "__main__":
    seed_database()
