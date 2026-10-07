import pytest
from datetime import date
from app.services.calculator import calculate_item_deadlines, ItemCalculationInput

def test_clothing_return_expiring_soon_5_days():
    # Purchase: 2026-09-10. Policy: 30 days clothing return -> Deadline: 2026-10-10
    # As-of date: 2026-10-05 -> Days remaining: 5 days (< 7)
    item = ItemCalculationInput(
        item_id="item-jacket",
        item_name="Winter Jacket",
        category="Clothing",
        price=4999.0,
        purchase_date="2026-09-10",
        policy_store="DemoMart",
        return_days=30,
        policy_section_code="§3.1"
    )
    as_of = date(2026, 10, 5)
    result = calculate_item_deadlines(item, as_of_date=as_of)
    
    assert result.return_deadline == "2026-10-10"
    assert result.return_days_remaining == 5
    assert result.expiring_soon is True
    assert result.status_label == "EXPIRING SOON"
    assert "5 days remaining" in result.explanation

def test_exactly_7_days_not_expiring_soon():
    # Purchase: 2026-09-10, 30 days -> 2026-10-10. As-of: 2026-10-03 -> 7 days remaining
    item = ItemCalculationInput(
        item_id="item-shoes",
        item_name="Running Shoes",
        category="Clothing",
        price=2499.0,
        purchase_date="2026-09-10",
        policy_store="DemoMart",
        return_days=30
    )
    as_of = date(2026, 10, 3)
    result = calculate_item_deadlines(item, as_of_date=as_of)
    
    assert result.return_days_remaining == 7
    assert result.expiring_soon is False  # 7 days is NOT expiring soon!
    assert result.status_label == "NORMAL"

def test_6_days_is_expiring_soon():
    # As-of 2026-10-04 -> 6 days remaining
    item = ItemCalculationInput(
        item_id="item-shoes",
        item_name="Running Shoes",
        category="Clothing",
        price=2499.0,
        purchase_date="2026-09-10",
        policy_store="DemoMart",
        return_days=30
    )
    as_of = date(2026, 10, 4)
    result = calculate_item_deadlines(item, as_of_date=as_of)
    
    assert result.return_days_remaining == 6
    assert result.expiring_soon is True  # 6 days IS expiring soon!
    assert result.status_label == "EXPIRING SOON"

def test_expired_return():
    # Purchase: 2026-09-10, 15 days -> 2026-09-25. As-of: 2026-10-05 -> -10 days
    item = ItemCalculationInput(
        item_id="item-laptop",
        item_name="Laptop",
        category="Electronics",
        price=75000.0,
        purchase_date="2026-09-10",
        policy_store="DemoMart",
        return_days=15,
        warranty_days=365
    )
    as_of = date(2026, 10, 5)
    result = calculate_item_deadlines(item, as_of_date=as_of)
    
    assert result.return_deadline == "2026-09-25"
    assert result.return_days_remaining == -10
    assert result.expiring_soon is True
    assert result.status_label == "EXPIRED"
    assert result.warranty_deadline == "2027-09-10"  # 2026-09-10 + 365 days = 2027-09-10
    assert result.warranty_days_remaining == (date(2027, 9, 10) - as_of).days
