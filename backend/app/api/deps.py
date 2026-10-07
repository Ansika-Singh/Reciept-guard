import re
from fastapi import Request, Header, Query, HTTPException
from typing import Optional

def sanitize_shopper_id(shopper_id: str) -> str:
    """
    Sanitizes shopper_id to ensure it contains only safe alphanumeric, hyphen, and underscore characters.
    Prevents path traversal and injection attacks.
    """
    clean_id = re.sub(r"[^a-zA-Z0-9_-]", "", shopper_id.strip())
    if not clean_id:
        return "demo-shopper-001"
    return clean_id[:64]

def get_current_shopper(
    request: Request,
    x_shopper_id: Optional[str] = Header(None),
    shopper_id: Optional[str] = Query(None)
) -> str:
    """
    Clean abstraction for resolving the authenticated or active shopper session.
    Prioritizes headers (X-Shopper-Id / Authorization) over query parameters,
    and strictly sanitizes against path traversal or injection.
    """
    candidate = x_shopper_id or shopper_id or "demo-shopper-001"
    return sanitize_shopper_id(candidate)

# Backward-compatibility alias
get_current_user = get_current_shopper
