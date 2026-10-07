import pytest
from app.services.receipt_service import parse_and_normalize_receipt
from app.services.receipt_validator import validate_structured_receipt

def test_structured_invoice_extraction():
    sample_invoice = """
DemoMart Superstore #1024
Invoice: INV-1024
Order ID: ORD-1001
Date: 20 Sep 2026
Customer: Alex Mercer
Payment: Credit Card

Items:
Winter Jacket — Qty 1 — ₹4,999.00
Running Shoes — Qty 2 — ₹2,499.00

Subtotal: ₹9,997.00
Tax: ₹1,799.00
Grand Total: ₹11,796.00
"""
    result = parse_and_normalize_receipt(sample_invoice, "invoice.txt")
    
    assert "DemoMart" in result["store_name"]
    assert result["invoice_number"] == "INV-1024"
    assert result["order_id"] == "ORD-1001"
    assert result["purchase_date"] == "2026-09-20"
    assert result["customer_name"] == "Alex Mercer"
    assert result["currency"] == "₹"
    assert result["subtotal"] == 9997.0
    assert result["tax_total"] == 1799.0
    assert result["grand_total"] == 11796.0
    
    assert len(result["items"]) == 2
    assert result["items"][0]["name"] == "Winter Jacket"
    assert result["items"][0]["quantity"] == 1
    assert result["items"][0]["total_price"] == 4999.0
    assert result["items"][1]["name"] == "Running Shoes"
    assert result["items"][1]["quantity"] == 2
    assert result["items"][1]["total_price"] == 4998.0

def test_missing_fields_are_strictly_null():
    sparse_bill = """
Cafe Coffee
Date: 2026-09-15
Espresso 150.00
Total 150.00
"""
    result = parse_and_normalize_receipt(sparse_bill, "bill.txt")
    
    assert result["store_name"] == "Cafe Coffee"
    assert result["purchase_date"] == "2026-09-15"
    assert result["invoice_number"] is None
    assert result["order_id"] is None
    assert result["customer_name"] is None
    assert result["store_address"] is None
    assert result["discount_total"] is None
    assert result["shipping_charges"] is None

def test_validation_arithmetic_matching():
    receipt_data = {
        "store_name": "DemoMart",
        "purchase_date": "2026-09-10",
        "subtotal": 1000.0,
        "tax_total": 180.0,
        "discount_total": 0.0,
        "shipping_charges": 0.0,
        "grand_total": 1180.0,
        "items": [
            {"name": "Item A", "quantity": 1, "unit_price": 600.0, "total_price": 600.0},
            {"name": "Item B", "quantity": 2, "unit_price": 200.0, "total_price": 400.0}
        ]
    }
    report = validate_structured_receipt(receipt_data)
    assert report["is_valid"] is True
    assert report["validation_status"] == "Verified Math"
    assert len(report["warnings"]) == 0

def test_validation_arithmetic_mismatch_detected():
    receipt_data = {
        "store_name": "DemoMart",
        "purchase_date": "2026-09-10",
        "subtotal": 1000.0,
        "tax_total": 180.0,
        "grand_total": 1500.0,  # Intentionally conflicting total
        "items": [
            {"name": "Item A", "quantity": 1, "unit_price": 1000.0, "total_price": 1000.0}
        ]
    }
    report = validate_structured_receipt(receipt_data)
    assert report["is_valid"] is False
    assert report["validation_status"] == "Receipt data requires verification"
    assert any("Receipt total requires verification" in w for w in report["warnings"])
