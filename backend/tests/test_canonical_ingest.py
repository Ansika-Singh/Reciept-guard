import os
import sys
import asyncio
import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.stdout.reconfigure(encoding='utf-8')
from app.database import SessionLocal, init_db
from app.services.pipeline import create_receipt_draft_pipeline, confirm_receipt_draft_pipeline
from app.models import Receipt, ReceiptItem, ReceiptInvoiceSection
from app.tools.order_tool import get_order_status
from app.tools.calculator_tool import calculate_return_warranty_windows

CANONICAL_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "canonical_documents")

@pytest.mark.asyncio
async def test_canonical_documents_ingestion():
    init_db()
    db = SessionLocal()

    # 1. Test Rich Dad Poor Dad
    rdpd_path = os.path.join(CANONICAL_DIR, "rich_dad_poor_dad.jpg")
    assert os.path.exists(rdpd_path)
    draft1 = await create_receipt_draft_pipeline(rdpd_path, "rich_dad_poor_dad.jpg", "shopper-test-01", db)
    assert draft1["store"] == "Amazon.in"
    assert draft1["order_id"] == "407-5019440-7312335"
    assert draft1["grand_total"] == 270.0
    assert len(draft1["items"]) == 1
    assert "Rich Dad Poor Dad" in draft1["items"][0]["name"]
    print("✓ Test A: Rich Dad Poor Dad passed.")

    # 2. Test Caffix The Tech Cafe
    caffix_path = os.path.join(CANONICAL_DIR, "caffix_tech_cafe.jpg")
    assert os.path.exists(caffix_path)
    draft2 = await create_receipt_draft_pipeline(caffix_path, "caffix_tech_cafe.jpg", "shopper-test-01", db)
    assert "Caffix" in draft2["store"]
    assert draft2["grand_total"] == 2136.0
    assert draft2["subtotal"] == 2039.0
    assert len(draft2["items"]) == 5
    tot_qty = sum(it["quantity"] for it in draft2["items"])
    assert tot_qty == 6
    print("✓ Test B: Caffix The Tech Cafe passed.")

    # 3. Test Mangalam Designer
    mangalam_path = os.path.join(CANONICAL_DIR, "mangalam_designer.jpg")
    assert os.path.exists(mangalam_path)
    draft3 = await create_receipt_draft_pipeline(mangalam_path, "mangalam_designer.jpg", "shopper-test-01", db)
    assert "Mangalam" in draft3["store"]
    assert draft3["sale_id"] == "SALE-2026"
    assert draft3["grand_total"] == 11700.0
    assert len(draft3["items"]) == 1
    assert draft3["items"][0]["name"] == "FANCY SAREE"
    print("✓ Test C: Mangalam Designer passed.")

    # 4. Test Kreo Hive 75 Keyboard PDF (2 Pages)
    kreo_path = os.path.join(CANONICAL_DIR, "kreo_hive_75.pdf")
    assert os.path.exists(kreo_path)
    draft4 = await create_receipt_draft_pipeline(kreo_path, "kreo_hive_75.pdf", "shopper-test-01", db)
    assert draft4["store"] == "Amazon.in"
    assert draft4["order_id"] == "405-0187084-9011564"
    assert draft4["grand_total"] == 4329.0  # CRITICAL: Product invoice total, NOT 4334
    assert len(draft4["invoice_sections"]) == 2
    # Verify Page 1 Marketplace Fee and Page 2 Product Invoice
    sec1 = draft4["invoice_sections"][0]
    sec2 = draft4["invoice_sections"][1]
    assert sec1["section_type"] == "marketplace_fee"
    assert sec1["grand_total"] == 5.0
    assert sec2["section_type"] == "product_invoice"
    assert sec2["grand_total"] == 4329.0
    print("✓ Test D: Kreo Hive 75 Keyboard 2-page PDF passed.")

    # 5. Test Confirmation & Preservation
    confirm_res = await confirm_receipt_draft_pipeline(draft4["draft_id"], db)
    assert confirm_res["receipt_id"]
    rcpt = db.query(Receipt).filter_by(receipt_id=confirm_res["receipt_id"]).first()
    assert rcpt is not None
    assert rcpt.grand_total == 4329.0
    assert len(rcpt.items) == 2
    assert len(rcpt.invoice_sections) == 2
    print("✓ Test E: Confirmation, Vault Storage & Sections passed.")

    # 6. Test Order Status Tool
    ord_found = get_order_status.invoke({"order_id": "405-0187084-9011564"})
    assert ord_found["found"] is True
    assert ord_found["status"] == "Delivered"

    ord_not_found = get_order_status.invoke({"order_id": "ORD-999999"})
    assert ord_not_found["found"] is False
    assert ord_not_found["status"] is None
    assert ord_not_found["message"] == "Order ID not found"
    print("✓ Test F: Order Status lookup (found & not found) passed.")

    db.close()

if __name__ == "__main__":
    asyncio.run(test_canonical_documents_ingestion())
