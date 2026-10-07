from fastapi import APIRouter
from app.schemas import OrderLookupRequest, OrderLookupResponse
from app.tools.order_tool import perform_order_lookup

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("/status", response_model=OrderLookupResponse)
def lookup_order_status_api(req: OrderLookupRequest):
    """
    Direct endpoint for order status verification.
    Queries mock SQLite order database with shopper ownership check.
    Gracefully handles unknown order IDs without fabricating data.
    """
    shopper = req.shopper_id or "demo-shopper-001"
    res = perform_order_lookup(order_id=req.order_id, shopper_id=shopper)
    return OrderLookupResponse(**res)
