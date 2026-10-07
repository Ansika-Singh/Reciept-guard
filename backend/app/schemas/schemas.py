from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- Shopper Schemas ---
class ShopperBase(BaseModel):
    name: str = "Demo Shopper"
    email: Optional[str] = None

class ShopperSchema(ShopperBase):
    shopper_id: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- Invoice Section Schemas ---
class ReceiptInvoiceSectionSchema(BaseModel):
    id: Optional[str] = None
    receipt_id: Optional[str] = None
    page_number: int = 1
    section_type: str = "product_invoice"  # marketplace_fee, product_invoice, general
    seller_name: Optional[str] = None
    invoice_number: Optional[str] = None
    invoice_date: Optional[str] = None
    subtotal: Optional[float] = None
    tax_total: Optional[float] = None
    grand_total: Optional[float] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True

# --- Receipt Item Schemas ---
class ReceiptItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    sku: Optional[str] = None
    asin: Optional[str] = None
    item_code: Optional[str] = None
    hsn: Optional[str] = None
    category: str
    quantity: int = 1
    unit_price: Optional[float] = None
    discount: Optional[float] = None
    discount_percent: Optional[float] = None
    discount_amount: Optional[float] = None
    tax: Optional[float] = None
    tax_rate: Optional[float] = None
    tax_type: Optional[str] = None
    tax_amount: Optional[float] = None
    price: float  # Line total
    total_price: Optional[float] = None
    serial_number: Optional[str] = None
    warranty_information: Optional[str] = None
    warranty_days_if_explicit: Optional[int] = None

class ReceiptItemSchema(ReceiptItemBase):
    item_id: str
    receipt_id: str

    class Config:
        from_attributes = True

# --- Calculation Schemas ---
class CalculationItemResult(BaseModel):
    calc_id: Optional[str] = None
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
    status_label: str  # EXPIRING SOON, NORMAL, EXPIRED
    applicable_policy_section: Optional[str] = None
    explanation: str

    class Config:
        from_attributes = True

# --- Receipt Schemas ---
class ReceiptResponse(BaseModel):
    receipt_id: str
    shopper_id: str
    store: str
    store_address: Optional[str] = None
    seller_name: Optional[str] = None
    buyer_name: Optional[str] = None
    sale_id: Optional[str] = None
    invoice_number: Optional[str] = None
    order_id: Optional[str] = None
    purchase_date: str
    purchase_time: Optional[str] = None
    customer_name: Optional[str] = None
    payment_method: Optional[str] = None
    currency: str = "₹"
    
    subtotal: Optional[float] = None
    discount_total: Optional[float] = None
    tax_total: Optional[float] = None
    shipping_charges: Optional[float] = None
    grand_total: Optional[float] = None
    amount_in_words: Optional[str] = None
    printed_return_policy: Optional[str] = None
    warranty_information: Optional[str] = None
    
    filename: Optional[str] = None
    original_filename: Optional[str] = None
    storage_key: Optional[str] = None
    file_type: Optional[str] = None
    mime_type: Optional[str] = None
    file_size: Optional[int] = None
    status: Optional[str] = "CONFIRMED"
    extraction_status: Optional[str] = "COMPLETED"
    verification_status: Optional[str] = "VERIFIED"
    is_archived: bool = False
    raw_text: Optional[str] = None
    ocr_confidence: Optional[float] = 1.0
    extraction_method: Optional[str] = "native_pdf"
    validation_status: Optional[str] = "Verified Math"
    
    file_view_url: Optional[str] = None
    file_download_url: Optional[str] = None
    
    created_at: datetime
    confirmed_at: Optional[datetime] = None
    items: List[ReceiptItemSchema] = []
    invoice_sections: List[ReceiptInvoiceSectionSchema] = []
    calculations: List[CalculationItemResult] = []

    class Config:
        from_attributes = True

# --- Protection Summary ---
class ExtractionDetails(BaseModel):
    extraction_method: str
    ocr_confidence: float
    confidence_level: str
    is_arithmetic_valid: bool
    validation_warnings: List[str] = []
    detected_fields: List[str] = []
    missing_fields: List[str] = []
    raw_text_preview: str

class ProtectionSummaryResponse(BaseModel):
    receipt_id: str
    store: str
    store_name: Optional[str] = None
    store_address: Optional[str] = None
    invoice_number: Optional[str] = None
    order_id: Optional[str] = None
    purchase_date: str
    purchase_time: Optional[str] = None
    customer_name: Optional[str] = None
    payment_method: Optional[str] = None
    currency: str = "₹"
    
    subtotal: Optional[float] = None
    discount_total: Optional[float] = None
    tax_total: Optional[float] = None
    shipping_charges: Optional[float] = None
    grand_total: Optional[float] = None
    math_validation_status: Optional[str] = "Verified Math"
    validation_warnings: List[str] = []
    
    total_items: int
    active_return_windows: int
    active_warranties: int
    expiring_soon_count: int
    expiring_items: List[CalculationItemResult] = []
    all_calculations: List[CalculationItemResult] = []
    all_items: List[ReceiptItemSchema] = []
    items: List[ReceiptItemSchema] = []
    alerts: List[str] = []
    
    extraction_details: Optional[ExtractionDetails] = None

# --- Policy Schemas ---
class PolicySectionSchema(BaseModel):
    section_id: str
    section_code: str
    title: str
    category: str
    policy_type: str
    days_allowed: int
    condition_text: Optional[str] = None
    full_text: str

    class Config:
        from_attributes = True

class StorePolicySchema(BaseModel):
    policy_id: str
    store: str
    title: str
    effective_date: str
    sections: List[PolicySectionSchema] = []

    class Config:
        from_attributes = True

# --- Order Lookup Schemas ---
class OrderLookupRequest(BaseModel):
    order_id: str
    shopper_id: Optional[str] = "demo-shopper-001"

class OrderLookupResponse(BaseModel):
    found: bool
    order_id: str
    shopper_id: Optional[str] = None
    status: Optional[str] = None
    tracking_number: Optional[str] = None
    carrier: Optional[str] = None
    estimated_delivery: Optional[str] = None
    last_updated: Optional[str] = None
    message: str

# --- Chat / RAG Schemas ---
class ChatRequest(BaseModel):
    shopper_id: str = "demo-shopper-001"
    receipt_id: Optional[str] = None
    question: str = Field(..., min_length=1)

class SourceCitation(BaseModel):
    source_type: str  # receipt_item / policy / order_database
    title: str
    reference: str
    snippet: str

class ChatResponse(BaseModel):
    answer: str
    sources: List[SourceCitation] = []
    grounded: bool = True

# --- Audit Log Schemas ---
class AuditLogSchema(BaseModel):
    audit_id: str
    receipt_id: Optional[str] = None
    shopper_id: str
    stage: str
    message: str
    timestamp: datetime

    class Config:
        from_attributes = True

# --- Draft / Review Staging Schemas ---
class ReceiptDraftItemSchema(BaseModel):
    draft_item_id: str
    draft_id: str
    name: str
    description: Optional[str] = None
    sku: Optional[str] = None
    asin: Optional[str] = None
    item_code: Optional[str] = None
    hsn: Optional[str] = None
    category: str = "General"
    quantity: int = 1
    unit_price: Optional[float] = None
    discount: Optional[float] = None
    discount_percent: Optional[float] = None
    discount_amount: Optional[float] = None
    tax: Optional[float] = None
    tax_rate: Optional[float] = None
    tax_type: Optional[str] = None
    tax_amount: Optional[float] = None
    price: float
    total_price: Optional[float] = None
    serial_number: Optional[str] = None
    warranty_information: Optional[str] = None
    warranty_days_if_explicit: Optional[int] = None

    class Config:
        from_attributes = True

class ReceiptDraftUpdateItem(BaseModel):
    draft_item_id: Optional[str] = None
    name: str
    description: Optional[str] = None
    sku: Optional[str] = None
    asin: Optional[str] = None
    item_code: Optional[str] = None
    hsn: Optional[str] = None
    category: str = "General"
    quantity: int = 1
    unit_price: Optional[float] = None
    discount: Optional[float] = None
    discount_percent: Optional[float] = None
    discount_amount: Optional[float] = None
    tax: Optional[float] = None
    tax_rate: Optional[float] = None
    tax_type: Optional[str] = None
    tax_amount: Optional[float] = None
    price: Optional[float] = None
    total_price: Optional[float] = None
    serial_number: Optional[str] = None
    warranty_information: Optional[str] = None
    warranty_days_if_explicit: Optional[int] = None

class ReceiptDraftUpdate(BaseModel):
    store: Optional[str] = None
    store_address: Optional[str] = None
    seller_name: Optional[str] = None
    buyer_name: Optional[str] = None
    sale_id: Optional[str] = None
    invoice_number: Optional[str] = None
    order_id: Optional[str] = None
    purchase_date: Optional[str] = None
    purchase_time: Optional[str] = None
    customer_name: Optional[str] = None
    payment_method: Optional[str] = None
    currency: Optional[str] = "₹"
    
    subtotal: Optional[float] = None
    discount_total: Optional[float] = None
    tax_total: Optional[float] = None
    shipping_charges: Optional[float] = None
    grand_total: Optional[float] = None
    amount_in_words: Optional[str] = None
    printed_return_policy: Optional[str] = None
    warranty_information: Optional[str] = None
    
    items: Optional[List[ReceiptDraftUpdateItem]] = None

class ReceiptDraftResponse(BaseModel):
    draft_id: str
    shopper_id: str
    store: str
    store_address: Optional[str] = None
    seller_name: Optional[str] = None
    buyer_name: Optional[str] = None
    sale_id: Optional[str] = None
    invoice_number: Optional[str] = None
    order_id: Optional[str] = None
    purchase_date: str
    purchase_time: Optional[str] = None
    customer_name: Optional[str] = None
    payment_method: Optional[str] = None
    currency: str = "₹"
    
    subtotal: Optional[float] = None
    discount_total: Optional[float] = None
    tax_total: Optional[float] = None
    shipping_charges: Optional[float] = None
    grand_total: Optional[float] = None
    amount_in_words: Optional[str] = None
    printed_return_policy: Optional[str] = None
    warranty_information: Optional[str] = None
    
    filename: Optional[str] = None
    file_type: Optional[str] = None
    preview_url: Optional[str] = None
    raw_text: Optional[str] = None
    ocr_confidence: float = 1.0
    extraction_method: str = "native_pdf"
    validation_status: str = "Verified Math"
    status: str = "REVIEW_REQUIRED"
    
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    items: List[ReceiptDraftItemSchema] = []
    invoice_sections: List[ReceiptInvoiceSectionSchema] = []
    extraction_details: Optional[ExtractionDetails] = None
    preview_calculations: List[CalculationItemResult] = []

    class Config:
        from_attributes = True

class DraftRecalculateResponse(BaseModel):
    draft_id: str
    is_arithmetic_valid: bool
    validation_status: str
    validation_warnings: List[str] = []
    subtotal: Optional[float] = None
    grand_total: Optional[float] = None
    preview_calculations: List[CalculationItemResult] = []

class DraftConfirmResponse(BaseModel):
    receipt_id: str
    status: str = "CONFIRMED"
    message: str
    summary: ProtectionSummaryResponse

# --- Receipt Vault / History Schemas ---
class ReceiptVaultCard(BaseModel):
    receipt_id: str
    shopper_id: str
    store: str
    seller_name: Optional[str] = None
    buyer_name: Optional[str] = None
    sale_id: Optional[str] = None
    invoice_number: Optional[str] = None
    order_id: Optional[str] = None
    purchase_date: str
    grand_total: Optional[float] = None
    currency: str = "₹"
    invoice_sections: List[ReceiptInvoiceSectionSchema] = []
    
    original_filename: Optional[str] = None
    file_type: str = "pdf"  # pdf, jpg, png, webp, txt
    mime_type: Optional[str] = None
    file_size: Optional[int] = None
    
    status: str = "CONFIRMED"  # CONFIRMED, REVIEW_REQUIRED, VERIFIED, ARCHIVED
    extraction_status: str = "COMPLETED"
    verification_status: str = "VERIFIED"
    is_archived: bool = False
    
    total_items: int = 0
    active_return_windows: int = 0
    active_warranties: int = 0
    has_expiring_soon: bool = False
    expiring_soon_count: int = 0
    expiring_badge_text: Optional[str] = None
    protection_status_label: str = "Protected"  # Protected, Review Required, Expiring Soon
    
    items_preview: List[str] = []
    
    file_view_url: str
    file_download_url: str
    confirmed_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ReceiptVaultListResponse(BaseModel):
    receipts: List[ReceiptVaultCard] = []
    total_count: int = 0
    stores: List[str] = []
    file_types: List[str] = []

class VaultStatsResponse(BaseModel):
    total_receipts: int = 0
    protected_purchases: int = 0
    expiring_soon_count: int = 0
    total_purchase_value: float = 0.0
    currency: str = "₹"
