import pytest
from app.seed_data import seed_database
from app.tools.order_tool import perform_order_lookup

@pytest.fixture(autouse=True)
def setup_db():
    seed_database()

def test_valid_order_lookup():
    result = perform_order_lookup("ORD-1001", shopper_id="demo-shopper-001")
    assert result["found"] is True
    assert result["order_id"] == "ORD-1001"
    assert result["status"] == "Delivered"
    assert result["tracking_number"] == "TRK123456987"

def test_invalid_order_lookup():
    result = perform_order_lookup("ORD-9999", shopper_id="demo-shopper-001")
    assert result["found"] is False
    assert result["order_id"] == "ORD-9999"
    assert "not found" in result["message"].lower()

def test_unauthorized_shopper_access():
    result = perform_order_lookup("ORD-1001", shopper_id="unauthorized-shopper-999")
    assert result["found"] is False
    assert "access denied" in result["message"].lower()
