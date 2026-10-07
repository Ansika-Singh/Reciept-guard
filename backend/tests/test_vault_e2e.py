import pytest
import os
import io
import fitz
from PIL import Image
from fastapi.testclient import TestClient

from app.main import app
from app.database import init_db
from app.seed_data import seed_database
from app.services.storage_service import resolve_vault_file_path

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_database():
    init_db()
    seed_database()
    yield

def make_pdf(text: str = "Test Store Receipt\nInvoice: INV-001\nTotal: 100"):
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 72), text)
    b = doc.tobytes()
    doc.close()
    return b

def make_jpg():
    img = Image.new("RGB", (120, 80), color=(200, 220, 240))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()

def make_png():
    img = Image.new("RGB", (120, 80), color=(240, 200, 220))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()

import uuid

def test_1_pdf_upload_confirm_in_vault():
    shopper = f"shopper-test-1-{uuid.uuid4().hex[:6]}"
    pdf_data = make_pdf("Target Retail\nInvoice: INV-TGT-101\nDate: 2026-09-10\nBackpack - 2500")
    
    # Upload
    up = client.post("/api/receipts/upload", files={"file": ("target_order.pdf", pdf_data, "application/pdf")}, data={"shopper_id": shopper})
    assert up.status_code == 200
    draft_id = up.json()["draft_id"]

    # Confirm
    conf = client.post(f"/api/receipts/draft/{draft_id}/confirm")
    assert conf.status_code == 200
    receipt_id = conf.json()["receipt_id"]

    # Vault
    vault = client.get(f"/api/receipts/vault?shopper_id={shopper}")
    assert vault.status_code == 200
    items = vault.json()["receipts"]
    assert len(items) == 1
    assert items[0]["receipt_id"] == receipt_id
    assert items[0]["file_type"] == "pdf"
    assert items[0]["original_filename"] == "target_order.pdf"

def test_2_and_3_jpg_and_png_preservation():
    shopper = f"shopper-images-{uuid.uuid4().hex[:6]}"
    jpg_data = make_jpg()
    png_data = make_png()

    # Upload JPG
    up_jpg = client.post("/api/receipts/upload", files={"file": ("store_snap.jpg", jpg_data, "image/jpeg")}, data={"shopper_id": shopper})
    assert up_jpg.status_code == 200
    conf_jpg = client.post(f"/api/receipts/draft/{up_jpg.json()['draft_id']}/confirm")
    jpg_r_id = conf_jpg.json()["receipt_id"]

    # Upload PNG
    up_png = client.post("/api/receipts/upload", files={"file": ("screenshot_bill.png", png_data, "image/png")}, data={"shopper_id": shopper})
    assert up_png.status_code == 200
    conf_png = client.post(f"/api/receipts/draft/{up_png.json()['draft_id']}/confirm")
    png_r_id = conf_png.json()["receipt_id"]

    # Check JPG file response
    jpg_file = client.get(f"/api/receipts/{jpg_r_id}/file?shopper_id={shopper}")
    assert jpg_file.status_code == 200
    assert "image/jpeg" in jpg_file.headers["content-type"]
    assert jpg_file.content == jpg_data

    # Check PNG download
    png_dl = client.get(f"/api/receipts/{png_r_id}/download?shopper_id={shopper}")
    assert png_dl.status_code == 200
    assert "screenshot_bill.png" in png_dl.headers.get("content-disposition", "")
    assert png_dl.content == png_data

def test_4_multiple_receipts_distinct():
    shopper = f"shopper-multi-{uuid.uuid4().hex[:6]}"
    for i in range(3):
        pdf_bytes = make_pdf(f"Store #{i}\nInvoice: INV-00{i}\nDate: 2026-09-10\nItem {i} - 1000")
        up = client.post("/api/receipts/upload", files={"file": (f"receipt_{i}.pdf", pdf_bytes, "application/pdf")}, data={"shopper_id": shopper})
        client.post(f"/api/receipts/draft/{up.json()['draft_id']}/confirm")

    vault = client.get(f"/api/receipts/vault?shopper_id={shopper}")
    assert vault.json()["total_count"] == 3

def test_5_edit_draft_before_confirmation():
    shopper = f"shopper-edit-{uuid.uuid4().hex[:6]}"
    txt = b"Demo Store Invoice INV-900 Date: 2026-09-01\nOld Item Price: 1000"
    up = client.post("/api/receipts/upload", files={"file": ("edit_bill.txt", txt, "text/plain")}, data={"shopper_id": shopper})
    draft_id = up.json()["draft_id"]

    # User edits store and invoice number
    client.patch(f"/api/receipts/draft/{draft_id}", json={
        "store": "Corrected DemoMart",
        "invoice_number": "INV-CORRECTED-999",
        "grand_total": 4500.0
    })

    # Confirm
    conf = client.post(f"/api/receipts/draft/{draft_id}/confirm")
    r_id = conf.json()["receipt_id"]

    # Verify permanent receipt has corrected values
    details = client.get(f"/api/receipts/{r_id}")
    assert details.status_code == 200
    data = details.json()
    assert data["store"] == "Corrected DemoMart"
    assert data["invoice_number"] == "INV-CORRECTED-999"
    assert data["grand_total"] == 4500.0

def test_6_unconfirmed_draft_not_in_vault():
    shopper = f"shopper-unconf-{uuid.uuid4().hex[:6]}"
    txt = b"Temp Draft Document"
    client.post("/api/receipts/upload", files={"file": ("temp.txt", txt, "text/plain")}, data={"shopper_id": shopper})

    # Vault should still be empty
    vault = client.get(f"/api/receipts/vault?shopper_id={shopper}")
    assert vault.json()["total_count"] == 0

def test_7_delete_receipt_cleans_file():
    shopper = f"shopper-del-{uuid.uuid4().hex[:6]}"
    pdf = make_pdf("Delete Store\nINV-DEL-1\nDate: 2026-09-10\nItem - 500")
    up = client.post("/api/receipts/upload", files={"file": ("to_delete.pdf", pdf, "application/pdf")}, data={"shopper_id": shopper})
    conf = client.post(f"/api/receipts/draft/{up.json()['draft_id']}/confirm")
    r_id = conf.json()["receipt_id"]

    details = client.get(f"/api/receipts/{r_id}").json()
    storage_key = details.get("storage_key")
    assert storage_key is not None

    # Delete
    del_res = client.delete(f"/api/receipts/{r_id}?shopper_id={shopper}")
    assert del_res.status_code == 200

    # Ensure file is removed from storage
    file_path = resolve_vault_file_path(storage_key)
    assert file_path is None or not os.path.exists(file_path)

def test_11_and_17_unauthorized_access():
    shopper_a = f"shopper-a-{uuid.uuid4().hex[:6]}"
    shopper_b = f"shopper-b-{uuid.uuid4().hex[:6]}"

    pdf = make_pdf("Confidential Store\nINV-SECRET\nDate: 2026-09-10\nItem - 9999")
    up = client.post("/api/receipts/upload", files={"file": ("secret.pdf", pdf, "application/pdf")}, data={"shopper_id": shopper_a})
    conf = client.post(f"/api/receipts/draft/{up.json()['draft_id']}/confirm")
    r_id = conf.json()["receipt_id"]

    # Shopper B attempts file view
    res = client.get(f"/api/receipts/{r_id}/file?shopper_id={shopper_b}")
    assert res.status_code == 404

    # Nonexistent receipt
    non_existent = client.get(f"/api/receipts/fake-uuid-000/file?shopper_id={shopper_a}")
    assert non_existent.status_code == 404

def test_18_duplicate_hash_warning():
    shopper = f"shopper-dup-{uuid.uuid4().hex[:6]}"
    txt = b"Store Dup INV-DUP-1111 Date: 2026-09-10 Item 500"
    
    # 1st upload & confirm
    up1 = client.post("/api/receipts/upload", files={"file": ("dup_receipt.txt", txt, "text/plain")}, data={"shopper_id": shopper})
    client.post(f"/api/receipts/draft/{up1.json()['draft_id']}/confirm")

    # 2nd upload of exact same file
    up2 = client.post("/api/receipts/upload", files={"file": ("dup_receipt.txt", txt, "text/plain")}, data={"shopper_id": shopper})
    assert up2.status_code == 200
    warnings = up2.json()["extraction_details"]["validation_warnings"]
    assert any("Duplicate Notice" in w for w in warnings)
