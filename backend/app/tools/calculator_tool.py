try:
    from langchain_core.tools import tool
except ImportError:
    try:
        from langchain.tools import tool
    except ImportError:
        def tool(func):
            return func
from typing import List, Optional, Dict, Any
from datetime import date
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Receipt, ReceiptItem, StorePolicy, PolicySection
from app.services.calculator import calculate_item_deadlines, ItemCalculationInput
from app.services.policy_service import get_policy_for_item

@tool
def calculate_return_warranty_windows(
    receipt_id: str,
    policy_id: Optional[str] = None,
    as_of_date: Optional[str] = None,
    **kwargs
) -> List[Dict[str, Any]]:
    """Computes per-item return/warranty deadlines as purchase_date + policy_days from the loaded receipt and policy; returns deadline, days_remaining, and expiring_soon flag for days_remaining < 7."""
    ref_date = date.fromisoformat(as_of_date) if as_of_date else date.today()
    
    db: Session = SessionLocal()
    try:
        receipt = db.query(Receipt).filter(Receipt.receipt_id == receipt_id).first()
        if not receipt:
            return []

        items = db.query(ReceiptItem).filter(ReceiptItem.receipt_id == receipt_id).all()
        results = []

        for item in items:
            policy_sec = None
            if policy_id:
                policy_sec = db.query(PolicySection).filter(
                    PolicySection.policy_id == policy_id,
                    PolicySection.category.ilike(item.category)
                ).first()
            if not policy_sec:
                policy_sec = get_policy_for_item(db, store_name=receipt.store, category=item.category, policy_type="return")

            ret_days = policy_sec.days_allowed if policy_sec else 30
            sec_code = policy_sec.section_code if policy_sec else "§StorePolicy"
            cond_text = policy_sec.condition_text if policy_sec else None

            warr_days = item.warranty_days_if_explicit
            if not warr_days and item.category.lower() == "electronics":
                w_sec = get_policy_for_item(db, store_name=receipt.store, category="Electronics", policy_type="warranty")
                if w_sec:
                    warr_days = w_sec.days_allowed

            calc_input = ItemCalculationInput(
                item_id=item.item_id,
                item_name=item.name,
                category=item.category,
                price=item.price,
                purchase_date=receipt.purchase_date,
                policy_store=receipt.store,
                return_days=ret_days,
                warranty_days=warr_days,
                policy_section_code=sec_code,
                policy_condition=cond_text
            )

            calc_out = calculate_item_deadlines(calc_input, as_of_date=ref_date)
            # Standard output format per PS requirements
            results.append({
                "name": calc_out.item_name,
                "purchase_date": calc_out.purchase_date,
                "return_deadline": calc_out.return_deadline,
                "return_days_remaining": calc_out.return_days_remaining,
                "warranty_deadline": calc_out.warranty_deadline,
                "warranty_days_remaining": calc_out.warranty_days_remaining,
                "expiring_soon_flag": calc_out.expiring_soon
            })

        return results
    finally:
        db.close()
