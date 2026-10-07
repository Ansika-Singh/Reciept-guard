from datetime import datetime, date, timedelta
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class ItemCalculationInput(BaseModel):
    item_id: str
    item_name: str
    category: str
    price: float
    purchase_date: str  # YYYY-MM-DD
    policy_store: str
    return_days: Optional[int] = None
    warranty_days: Optional[int] = None
    policy_section_code: Optional[str] = None
    policy_condition: Optional[str] = None

class ItemCalculationOutput(BaseModel):
    item_id: str
    item_name: str
    category: str
    price: float
    purchase_date: str
    
    return_deadline: str
    return_days_remaining: int
    
    warranty_deadline: Optional[str] = None
    warranty_days_remaining: Optional[int] = None
    
    expiring_soon: bool
    status_label: str  # "EXPIRING SOON", "NORMAL", "EXPIRED"
    applicable_policy_section: Optional[str] = None
    explanation: str

def parse_iso_date(date_str: str) -> date:
    """Parses various date string formats into date object."""
    date_str = date_str.strip()
    formats = [
        "%Y-%m-%d",
        "%d-%m-%Y",
        "%d/%m/%Y",
        "%m/%d/%Y",
        "%d %B %Y",
        "%d %b %Y",
        "%B %d, %Y",
        "%b %d, %Y"
    ]
    for fmt in formats:
        try:
            return datetime.strptime(date_str, fmt).date()
        except ValueError:
            continue
    # Default fallback to today if unparseable
    return date.today()

def calculate_item_deadlines(
    item_input: ItemCalculationInput,
    as_of_date: Optional[date] = None
) -> ItemCalculationOutput:
    """
    Computes per-item return and warranty deadlines as purchase_date + policy_days
    from the loaded receipt and policy.
    Returns deadline, days_remaining, and expiring_soon.
    expiring_soon is true strictly when days_remaining is less than 7.
    """
    if as_of_date is None:
        # Default as-of date is today
        as_of_date = date.today()

    p_date = parse_iso_date(item_input.purchase_date)

    # 1. Return Deadline Calculation
    return_days = item_input.return_days if item_input.return_days is not None else 30
    return_deadline_date = p_date + timedelta(days=return_days)
    return_days_rem = (return_deadline_date - as_of_date).days

    # 2. Warranty Deadline Calculation
    warranty_deadline_str = None
    warranty_days_rem = None
    if item_input.warranty_days and item_input.warranty_days > 0:
        warranty_deadline_date = p_date + timedelta(days=item_input.warranty_days)
        warranty_deadline_str = warranty_deadline_date.isoformat()
        warranty_days_rem = (warranty_deadline_date - as_of_date).days

    # 3. Status Classification & Expiring Flag
    # Strict rule: days_remaining < 7 is expiring_soon (7 days is NOT expiring soon!)
    if return_days_rem < 0:
        status_label = "EXPIRED"
        expiring_soon = True
    elif return_days_rem < 7:
        status_label = "EXPIRING SOON"
        expiring_soon = True
    else:
        status_label = "NORMAL"
        expiring_soon = False

    # 4. Formatted Explanation & Citing
    p_date_formatted = p_date.strftime("%d %b %Y")
    deadline_formatted = return_deadline_date.strftime("%d %b %Y")
    section_ref = item_input.policy_section_code or "Store Policy"
    
    if return_days_rem < 0:
        days_str = f"Expired {abs(return_days_rem)} days ago"
    elif return_days_rem == 0:
        days_str = "Expires TODAY"
    else:
        days_str = f"{return_days_rem} days remaining"

    explanation = (
        f"Purchased: {p_date_formatted} | "
        f"Policy: {return_days}-day {item_input.category.lower()} return ({section_ref}) | "
        f"Deadline: {deadline_formatted} | "
        f"Status: {days_str}"
    )

    if item_input.policy_condition:
        explanation += f" | Condition: {item_input.policy_condition}"

    return ItemCalculationOutput(
        item_id=item_input.item_id,
        item_name=item_input.item_name,
        category=item_input.category,
        price=item_input.price,
        purchase_date=item_input.purchase_date,
        return_deadline=return_deadline_date.isoformat(),
        return_days_remaining=return_days_rem,
        warranty_deadline=warranty_deadline_str,
        warranty_days_remaining=warranty_days_rem,
        expiring_soon=expiring_soon,
        status_label=status_label,
        applicable_policy_section=f"{item_input.policy_store} {section_ref}",
        explanation=explanation
    )
