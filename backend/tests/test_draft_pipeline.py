import pytest
import os
from datetime import date
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.models import ReceiptDraft, ReceiptItemDraft, Receipt, ReceiptItem, CalculationResult, Shopper
from app.services.pipeline import (
    create_receipt_draft_pipeline,
    recalculate_draft_state,
    confirm_receipt_draft_pipeline
)
from app.seed_data import seed_database

TEST_DB_URL = "sqlite:///:memory:"

@pytest.fixture
def db_session():
    engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    seed_database(session)
    yield session
    session.close()
    Base.metadata.drop_all(bind=engine)

@pytest.mark.asyncio
async def test_draft_creation_is_temporary(db_session):
    sample_text = """DemoMart Superstore
Invoice: INV-2024
Date: 2026-09-10
Winter Jacket — Qty 1 — ₹4,999.00
Running Shoes — Qty 2 — ₹2,499.00
Grand Total: ₹9,997.00
"""
    tmp_path = "temp_test_receipt.txt"
    with open(tmp_path, "w", encoding="utf-8") as f:
        f.write(sample_text)

    try:
        draft_res = await create_receipt_draft_pipeline(
            file_path=tmp_path,
            filename="temp_test_receipt.txt",
            shopper_id="demo-shopper-001",
            db=db_session
        )

        draft_id = draft_res["draft_id"]
        assert draft_id is not None
        assert draft_res["status"] == "REVIEW_REQUIRED"
        assert len(draft_res["items"]) == 2

        # Check that unconfirmed draft is NOT stored in permanent receipt table
        permanent_receipts = db_session.query(Receipt).filter(Receipt.receipt_id == draft_id).all()
        assert len(permanent_receipts) == 0

        # Draft exists in draft table
        draft_in_db = db_session.query(ReceiptDraft).filter(ReceiptDraft.draft_id == draft_id).first()
        assert draft_in_db is not None
        assert draft_in_db.status == "REVIEW_REQUIRED"

    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

@pytest.mark.asyncio
async def test_draft_editing_and_recalculation(db_session):
    sample_text = """DemoMart
Date: 2026-09-10
Winter J_cket 4999.00
Total 4999.00
"""
    tmp_path = "temp_edit_test.txt"
    with open(tmp_path, "w", encoding="utf-8") as f:
        f.write(sample_text)

    try:
        draft_res = await create_receipt_draft_pipeline(
            file_path=tmp_path,
            filename="temp_edit_test.txt",
            shopper_id="demo-shopper-001",
            db=db_session
        )
        draft_id = draft_res["draft_id"]

        # Edit item name and purchase date
        edit_payload = {
            "store": "DemoMart Superstore",
            "purchase_date": "2026-09-15",
            "items": [
                {
                    "name": "Winter Jacket (Corrected)",
                    "category": "Clothing",
                    "quantity": 1,
                    "unit_price": 4999.0,
                    "price": 4999.0,
                    "total_price": 4999.0
                }
            ],
            "subtotal": 4999.0,
            "grand_total": 4999.0
        }

        recalc_res = recalculate_draft_state(draft_id, db_session, edit_payload)
        assert recalc_res["is_arithmetic_valid"] is True
        assert recalc_res["validation_status"] == "Verified Math"
        assert len(recalc_res["preview_calculations"]) == 1
        assert recalc_res["preview_calculations"][0]["item_name"] == "Winter Jacket (Corrected)"
        # 15 Sep + 30 days = 15 Oct
        assert recalc_res["preview_calculations"][0]["return_deadline"] == "2026-10-15"

    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

@pytest.mark.asyncio
async def test_confirm_and_save_pipeline(db_session):
    sample_text = """DemoMart
Date: 2026-09-10
Winter Jacket 4999.00
Total 4999.00
"""
    tmp_path = "temp_confirm_test.txt"
    with open(tmp_path, "w", encoding="utf-8") as f:
        f.write(sample_text)

    try:
        draft_res = await create_receipt_draft_pipeline(
            file_path=tmp_path,
            filename="temp_confirm_test.txt",
            shopper_id="demo-shopper-001",
            db=db_session
        )
        draft_id = draft_res["draft_id"]

        confirm_res = await confirm_receipt_draft_pipeline(draft_id, db_session)
        receipt_id = confirm_res["receipt_id"]
        assert receipt_id is not None

        # Verify permanent records created
        perm_rec = db_session.query(Receipt).filter(Receipt.receipt_id == receipt_id).first()
        assert perm_rec is not None
        assert perm_rec.store == "DemoMart"

        perm_items = db_session.query(ReceiptItem).filter(ReceiptItem.receipt_id == receipt_id).all()
        assert len(perm_items) == 1

        calcs = db_session.query(CalculationResult).filter(CalculationResult.receipt_id == receipt_id).all()
        assert len(calcs) == 1
        assert calcs[0].return_deadline == "2026-10-10"

        # Verify draft status updated to CONFIRMED
        draft_db = db_session.query(ReceiptDraft).filter(ReceiptDraft.draft_id == draft_id).first()
        assert draft_db.status == "CONFIRMED"

    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
