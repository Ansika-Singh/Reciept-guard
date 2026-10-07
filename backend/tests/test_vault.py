import pytest
import os
import io
import uuid
import fitz
from PIL import Image
from fastapi.testclient import TestClient

from app.main import app
from app.database import Base, engine, get_db, init_db
from app.seed_data import seed_database
from app.config import settings

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    init_db()
    seed_database()
    yield

def create_sample_png_bytes():
    img = Image.new("RGB", (200, 100), color=(255, 255, 255))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()

def create_sample_pdf_bytes(text_content: str = "Demo Store Invoice INV-9988\nDate: 2026-09-15\nItem: Test Product ₹5000"):
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 72), text_content)
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes

def test_vault_stats_and_listing():
    shopper_id = f"shopper-fresh-{uuid.uuid4().hex[:6]}"

    # Initially empty for fresh shopper
    res = client.get(f"/api/receipts/vault?shopper_id={shopper_id}")
    assert res.status_code == 200
    data = res.json()
    assert data["total_count"] == 0
    assert data["receipts"] == []

    stats_res = client.get(f"/api/receipts/vault/stats?shopper_id={shopper_id}")
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert stats["total_receipts"] == 0
    assert stats["total_purchase_value"] == 0.0

def test_vault_original_file_preservation_and_download():
    shopper_id = f"shopper-pres-{uuid.uuid4().hex[:6]}"
    
    sample_png = create_sample_png_bytes()
    files = {"file": ("my_custom_invoice.png", sample_png, "image/png")}
    data = {"shopper_id": shopper_id}

    # 1. Upload & Create Draft
    upload_res = client.post("/api/receipts/upload", files=files, data=data)
    assert upload_res.status_code == 200
    draft_id = upload_res.json()["draft_id"]

    # 2. Confirm Draft
    confirm_res = client.post(f"/api/receipts/draft/{draft_id}/confirm")
    assert confirm_res.status_code == 200
    receipt_id = confirm_res.json()["receipt_id"]

    # 3. Vault Listing Verification
    vault_res = client.get(f"/api/receipts/vault?shopper_id={shopper_id}")
    assert vault_res.status_code == 200
    v_data = vault_res.json()
    assert v_data["total_count"] == 1
    receipt_card = v_data["receipts"][0]
    assert receipt_card["receipt_id"] == receipt_id
    assert receipt_card["original_filename"] == "my_custom_invoice.png"
    assert receipt_card["file_type"] == "png"
    assert receipt_card["mime_type"] == "image/png"

    # 4. View Original Inline (GET /{receipt_id}/file)
    file_view = client.get(f"/api/receipts/{receipt_id}/file?shopper_id={shopper_id}")
    assert file_view.status_code == 200
    assert "image/png" in file_view.headers["content-type"]
    assert file_view.content == sample_png

    # 5. Download Original (GET /{receipt_id}/download)
    download_res = client.get(f"/api/receipts/{receipt_id}/download?shopper_id={shopper_id}")
    assert download_res.status_code == 200
    assert "attachment" in download_res.headers.get("content-disposition", "")
    assert "my_custom_invoice.png" in download_res.headers.get("content-disposition", "")
    assert download_res.content == sample_png

def test_vault_shopper_isolation():
    shopper_a = f"shopper-alice-{uuid.uuid4().hex[:6]}"
    shopper_b = f"shopper-bob-{uuid.uuid4().hex[:6]}"

    # Upload for Shopper A
    sample_txt = b"DemoMart Invoice INV-9901 Date: 2026-09-10\nItem: Smart Watch INR 15,000"
    files = {"file": ("alice_watch_bill.txt", sample_txt, "text/plain")}
    up = client.post("/api/receipts/upload", files=files, data={"shopper_id": shopper_a})
    draft_id = up.json()["draft_id"]
    conf = client.post(f"/api/receipts/draft/{draft_id}/confirm")
    alice_receipt_id = conf.json()["receipt_id"]

    # Shopper A can see in vault
    vault_a = client.get(f"/api/receipts/vault?shopper_id={shopper_a}")
    assert vault_a.json()["total_count"] == 1

    # Shopper B sees 0 receipts in their vault
    vault_b = client.get(f"/api/receipts/vault?shopper_id={shopper_b}")
    assert vault_b.json()["total_count"] == 0

    # Shopper B CANNOT view or download Alice's receipt file
    unauth_view = client.get(f"/api/receipts/{alice_receipt_id}/file?shopper_id={shopper_b}")
    assert unauth_view.status_code == 404

    unauth_down = client.get(f"/api/receipts/{alice_receipt_id}/download?shopper_id={shopper_b}")
    assert unauth_down.status_code == 404

def test_vault_search_filter_sort():
    shopper_id = f"shopper-search-{uuid.uuid4().hex[:6]}"

    # Seed 2 receipts
    txt1 = b"Amazon Order ORD-8811 Date: 2026-08-01\nKindle Paperwhite Qty 1 Price: 9999\nGrand Total: 9999"
    up1 = client.post("/api/receipts/upload", files={"file": ("kindle_invoice.txt", txt1, "text/plain")}, data={"shopper_id": shopper_id})
    client.post(f"/api/receipts/draft/{up1.json()['draft_id']}/confirm")

    pdf_bytes = create_sample_pdf_bytes("Apple Store\nInvoice INV-3322 Date: 2026-09-15\nMacBook Air Qty 1 Price: 99900\nGrand Total: 99900")
    up2 = client.post("/api/receipts/upload", files={"file": ("apple_macbook.pdf", pdf_bytes, "application/pdf")}, data={"shopper_id": shopper_id})
    client.post(f"/api/receipts/draft/{up2.json()['draft_id']}/confirm")

    # Search by store
    s_res = client.get(f"/api/receipts/vault?shopper_id={shopper_id}&query=Apple")
    assert s_res.json()["total_count"] == 1
    assert "Apple" in s_res.json()["receipts"][0]["store"]

    # Search by product name
    p_res = client.get(f"/api/receipts/vault?shopper_id={shopper_id}&query=Kindle")
    assert p_res.json()["total_count"] == 1

    # Filter by file type
    ft_res = client.get(f"/api/receipts/vault?shopper_id={shopper_id}&file_type=pdf")
    assert ft_res.json()["total_count"] == 1
    assert ft_res.json()["receipts"][0]["file_type"] == "pdf"

    # Sort highest total
    sort_res = client.get(f"/api/receipts/vault?shopper_id={shopper_id}&sort_by=highest_total")
    assert sort_res.json()["total_count"] == 2
    assert sort_res.json()["receipts"][0]["grand_total"] >= sort_res.json()["receipts"][1]["grand_total"]

def test_vault_archive_and_delete():
    shopper_id = f"shopper-archive-{uuid.uuid4().hex[:6]}"
    txt = b"Flipkart Invoice FK-5544 Date: 2026-09-01\nHeadphones Qty 1 Price: 1999"
    up = client.post("/api/receipts/upload", files={"file": ("flipkart_receipt.txt", txt, "text/plain")}, data={"shopper_id": shopper_id})
    conf = client.post(f"/api/receipts/draft/{up.json()['draft_id']}/confirm")
    r_id = conf.json()["receipt_id"]

    # Archive
    arch_res = client.post(f"/api/receipts/{r_id}/archive?shopper_id={shopper_id}")
    assert arch_res.status_code == 200
    assert arch_res.json()["is_archived"] is True

    # Active vault excludes archived by default
    active_vault = client.get(f"/api/receipts/vault?shopper_id={shopper_id}")
    assert active_vault.json()["total_count"] == 0

    # Archived filter shows it
    arch_vault = client.get(f"/api/receipts/vault?shopper_id={shopper_id}&status_filter=archived")
    assert arch_vault.json()["total_count"] == 1

    # Delete
    del_res = client.delete(f"/api/receipts/{r_id}?shopper_id={shopper_id}")
    assert del_res.status_code == 200
    assert del_res.json()["deleted"] is True

    # Confirm completely gone
    all_vault = client.get(f"/api/receipts/vault?shopper_id={shopper_id}&include_archived=true")
    assert all_vault.json()["total_count"] == 0
