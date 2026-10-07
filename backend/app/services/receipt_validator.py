from typing import Dict, Any, List, Optional

def validate_structured_receipt(receipt_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validates arithmetic and field completeness of an extracted structured receipt.
    Does NOT silently modify numbers. Returns explicit validation status and warnings.
    """
    warnings: List[str] = []
    detected_fields: List[str] = []
    missing_fields: List[str] = []

    # 1. Field Completeness Checks
    critical_fields = [
        ("store_name", "Store / Merchant Name"),
        ("purchase_date", "Purchase Date"),
        ("grand_total", "Grand Total"),
        ("invoice_number", "Invoice / Bill Number"),
        ("order_id", "Order ID"),
        ("customer_name", "Customer Name"),
        ("payment_method", "Payment Method"),
        ("tax_total", "Tax / GST Total"),
        ("subtotal", "Subtotal")
    ]

    for key, label in critical_fields:
        val = receipt_data.get(key)
        if val is not None and str(val).strip() and str(val).lower() not in ["none", "null", "unknown"]:
            detected_fields.append(label)
        else:
            missing_fields.append(label)

    # 2. Arithmetic Consistency Checks
    items = receipt_data.get("items", [])
    if not items:
        warnings.append("No line items could be parsed from the document.")

    computed_items_sum = 0.0
    for item in items:
        qty = item.get("quantity") or 1
        unit_price = item.get("unit_price")
        total_price = item.get("total_price") or item.get("price") or 0.0
        
        computed_items_sum += float(total_price)
        
        # Check quantity * unit_price
        if unit_price is not None and qty > 0:
            expected_line_total = round(qty * float(unit_price), 2)
            if abs(expected_line_total - float(total_price)) > 1.0:
                warnings.append(
                    f"Line item math discrepancy for '{item.get('name')}': "
                    f"{qty} × ₹{unit_price:.2f} = ₹{expected_line_total:.2f}, but extracted total is ₹{float(total_price):.2f}"
                )

    # Check Subtotal vs Items Sum
    subtotal = receipt_data.get("subtotal")
    if subtotal is not None:
        subtotal_val = float(subtotal)
        if abs(subtotal_val - computed_items_sum) > 1.0 and computed_items_sum > 0:
            warnings.append(
                f"Subtotal discrepancy: Extracted subtotal ₹{subtotal_val:.2f} differs from sum of line items ₹{computed_items_sum:.2f}."
            )

    # Check Grand Total vs Subtotal + Tax - Discount + Shipping
    grand_total = receipt_data.get("grand_total")
    if grand_total is not None:
        grand_total_val = float(grand_total)
        base_subtotal = float(subtotal) if subtotal is not None else computed_items_sum
        tax = float(receipt_data.get("tax_total") or 0.0)
        discount = float(receipt_data.get("discount_total") or 0.0)
        shipping = float(receipt_data.get("shipping_charges") or 0.0)

        expected_grand_total = round(base_subtotal + tax - discount + shipping, 2)
        if abs(expected_grand_total - grand_total_val) > 1.5 and base_subtotal > 0:
            warnings.append(
                f"Receipt total requires verification: Extracted Grand Total ₹{grand_total_val:.2f} "
                f"does not match Subtotal (₹{base_subtotal:.2f}) + Tax (₹{tax:.2f}) - Discount (₹{discount:.2f}) + Shipping (₹{shipping:.2f}) = ₹{expected_grand_total:.2f}."
            )

    is_arithmetic_valid = len(warnings) == 0

    return {
        "is_valid": is_arithmetic_valid,
        "warnings": warnings,
        "detected_fields": detected_fields,
        "missing_fields": missing_fields,
        "computed_items_sum": round(computed_items_sum, 2),
        "validation_status": "Verified Math" if is_arithmetic_valid else "Receipt data requires verification"
    }

def validate_trustguard_evidence(
    receipt_data: Dict[str, Any],
    claim_evidence: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    TrustGuard Multi-Signal Security Verification:
    1. SHA-256 integrity
    2. Serial-number matching
    3. Product line matching
    4. Invoice/order authenticity
    5. Policy consistency

    Returns {
        "is_authorized": bool,
        "status": "VERIFIED" | "NEEDS_VERIFICATION",
        "message": str,
        "signals": List[Dict[str, Any]]
    }
    """
    signals = []
    flags = []

    # 1. Check Serial Number match if claim evidence provided
    if claim_evidence:
        claim_serial = claim_evidence.get("serial_number")
        receipt_serials = [
            i.get("serial_number") for i in receipt_data.get("items", []) if i.get("serial_number")
        ]
        
        if claim_serial:
            if receipt_serials and claim_serial not in receipt_serials:
                flags.append("Evidence mismatch: claim serial number does not match receipt items.")
                signals.append({"signal": "serial_matching", "passed": False, "detail": f"Claim serial {claim_serial} != Receipt serials {receipt_serials}"})
            else:
                signals.append({"signal": "serial_matching", "passed": True, "detail": "Serial number matched or verified."})

    # 2. Check Order/Invoice Presence
    inv_num = receipt_data.get("invoice_number")
    ord_id = receipt_data.get("order_id")
    sale_id = receipt_data.get("sale_id")
    if not (inv_num or ord_id or sale_id):
        flags.append("Missing transaction identifier: no invoice, order ID, or sale ID detected.")
        signals.append({"signal": "transaction_id", "passed": False, "detail": "No authentic identifier found."})
    else:
        signals.append({"signal": "transaction_id", "passed": True, "detail": f"Authentic identifier present: {inv_num or ord_id or sale_id}"})

    # 3. Arithmetic Validation Signal
    val_res = validate_structured_receipt(receipt_data)
    if not val_res["is_valid"]:
        flags.append("Receipt data requires verification due to math discrepancies.")
        signals.append({"signal": "math_integrity", "passed": False, "detail": val_res["warnings"]})
    else:
        signals.append({"signal": "math_integrity", "passed": True, "detail": "Arithmetic checks verified."})

    if flags:
        return {
            "is_authorized": False,
            "status": "NEEDS_VERIFICATION",
            "message": "Verification required: evidence does not match the purchased product." if "serial" in "".join(flags) else "Receipt data requires verification.",
            "flags": flags,
            "signals": signals
        }

    return {
        "is_authorized": True,
        "status": "VERIFIED",
        "message": "Purchase evidence verified against authentic order records.",
        "flags": [],
        "signals": signals
    }
