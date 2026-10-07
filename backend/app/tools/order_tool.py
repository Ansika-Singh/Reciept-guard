try:
    from langchain_core.tools import tool
except ImportError:
    try:
        from langchain.tools import tool
    except ImportError:
        def tool(func):
            return func
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Order

def perform_order_lookup(order_id: str, shopper_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Queries the official relational database for the authentic order status.
    If found: returns the actual stored database record.
    If not found: returns found=False, status=None, message='Order ID not found'.
    Never fabricates order status or tracking info.
    """
    db: Session = SessionLocal()
    try:
        clean_order_id = str(order_id).strip()
        # Query order by exact or case-insensitive match
        order = db.query(Order).filter(Order.order_id.ilike(clean_order_id)).first()

        if not order:
            return {
                "found": False,
                "order_id": clean_order_id,
                "status": None,
                "tracking_number": None,
                "carrier": None,
                "estimated_delivery": None,
                "last_updated": None,
                "message": "Order ID not found"
            }

        if shopper_id and order.shopper_id != shopper_id:
            return {
                "found": False,
                "order_id": clean_order_id,
                "status": None,
                "tracking_number": None,
                "carrier": None,
                "estimated_delivery": None,
                "last_updated": None,
                "message": "Access denied: Order belongs to another shopper account."
            }

        return {
            "found": True,
            "order_id": order.order_id,
            "shopper_id": order.shopper_id,
            "status": order.status,
            "tracking_number": order.tracking_number,
            "carrier": order.carrier,
            "estimated_delivery": order.estimated_delivery,
            "last_updated": order.last_updated.isoformat() if order.last_updated else None,
            "message": f"Order {order.order_id} is currently '{order.status}'."
        }
    finally:
        db.close()

@tool
def get_order_status(order_id: str) -> Dict[str, Any]:
    """Queries the order database for an order ID. If found, returns the actual stored database record; if not found, returns found=false, status=null, message='Order ID not found'."""
    return perform_order_lookup(order_id=order_id)

# Alias for backward compatibility
lookup_order_status = get_order_status
