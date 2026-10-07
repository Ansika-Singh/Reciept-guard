from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, Index
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Shopper(Base):
    __tablename__ = "shoppers"
    
    shopper_id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False, default="Demo Shopper")
    email = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    receipts = relationship("Receipt", back_populates="shopper", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="shopper", cascade="all, delete-orphan")

class Receipt(Base):
    __tablename__ = "receipts"
    
    receipt_id = Column(String, primary_key=True, default=generate_uuid)
    shopper_id = Column(String, ForeignKey("shoppers.shopper_id"), nullable=False, index=True)
    store = Column(String, nullable=False)
    store_address = Column(String, nullable=True)
    seller_name = Column(String, nullable=True)
    buyer_name = Column(String, nullable=True)
    sale_id = Column(String, nullable=True)
    invoice_number = Column(String, nullable=True)
    order_id = Column(String, nullable=True, index=True)
    purchase_date = Column(String, nullable=False)  # ISO YYYY-MM-DD
    purchase_time = Column(String, nullable=True)
    customer_name = Column(String, nullable=True)
    payment_method = Column(String, nullable=True)
    currency = Column(String, default="₹")
    
    subtotal = Column(Float, nullable=True)
    discount_total = Column(Float, nullable=True)
    tax_total = Column(Float, nullable=True)
    shipping_charges = Column(Float, nullable=True)
    grand_total = Column(Float, nullable=True)
    amount_in_words = Column(String, nullable=True)
    printed_return_policy = Column(String, nullable=True)
    warranty_information = Column(String, nullable=True)
    
    filename = Column(String, nullable=True)
    original_filename = Column(String, nullable=True)
    storage_key = Column(String, nullable=True)
    file_type = Column(String, nullable=True)  # pdf, jpg, png, webp, txt
    mime_type = Column(String, nullable=True)
    file_size = Column(Integer, nullable=True)
    file_hash = Column(String, nullable=True, index=True)
    raw_text = Column(Text, nullable=True)
    ocr_confidence = Column(Float, default=1.0)
    extraction_method = Column(String, default="native_pdf")
    validation_status = Column(String, default="Verified Math")
    status = Column(String, default="CONFIRMED")  # DRAFT, REVIEW_REQUIRED, CONFIRMED, VERIFIED, ARCHIVED
    extraction_status = Column(String, default="COMPLETED")
    verification_status = Column(String, default="VERIFIED")
    is_archived = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    confirmed_at = Column(DateTime, default=datetime.utcnow)

    shopper = relationship("Shopper", back_populates="receipts")
    items = relationship("ReceiptItem", back_populates="receipt", cascade="all, delete-orphan")
    invoice_sections = relationship("ReceiptInvoiceSection", back_populates="receipt", cascade="all, delete-orphan")
    calculations = relationship("CalculationResult", back_populates="receipt", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="receipt", cascade="all, delete-orphan")

class ReceiptInvoiceSection(Base):
    __tablename__ = "receipt_invoice_sections"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    receipt_id = Column(String, ForeignKey("receipts.receipt_id"), nullable=False, index=True)
    page_number = Column(Integer, default=1)
    section_type = Column(String, default="product_invoice")  # marketplace_fee, product_invoice, general
    seller_name = Column(String, nullable=True)
    invoice_number = Column(String, nullable=True)
    invoice_date = Column(String, nullable=True)
    subtotal = Column(Float, nullable=True)
    tax_total = Column(Float, nullable=True)
    grand_total = Column(Float, nullable=True)
    notes = Column(String, nullable=True)
    
    receipt = relationship("Receipt", back_populates="invoice_sections")

class ReceiptItem(Base):
    __tablename__ = "receipt_items"
    
    item_id = Column(String, primary_key=True, default=generate_uuid)
    receipt_id = Column(String, ForeignKey("receipts.receipt_id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    sku = Column(String, nullable=True)
    asin = Column(String, nullable=True)
    item_code = Column(String, nullable=True)
    hsn = Column(String, nullable=True)
    category = Column(String, nullable=False)
    quantity = Column(Integer, default=1)
    unit_price = Column(Float, nullable=True)
    discount = Column(Float, nullable=True)
    discount_percent = Column(Float, nullable=True)
    discount_amount = Column(Float, nullable=True)
    tax = Column(Float, nullable=True)
    tax_rate = Column(Float, nullable=True)
    tax_type = Column(String, nullable=True)
    tax_amount = Column(Float, nullable=True)
    price = Column(Float, nullable=False)  # Line total
    total_price = Column(Float, nullable=True)
    serial_number = Column(String, nullable=True)
    warranty_information = Column(String, nullable=True)
    warranty_days_if_explicit = Column(Integer, nullable=True)

    receipt = relationship("Receipt", back_populates="items")
    calculation = relationship("CalculationResult", back_populates="item", uselist=False, cascade="all, delete-orphan")

class StorePolicy(Base):
    __tablename__ = "policies"
    
    policy_id = Column(String, primary_key=True, default=generate_uuid)
    store = Column(String, nullable=False, unique=True)
    title = Column(String, nullable=False)
    effective_date = Column(String, nullable=False)

    sections = relationship("PolicySection", back_populates="policy", cascade="all, delete-orphan")

class PolicySection(Base):
    __tablename__ = "policy_sections"
    
    section_id = Column(String, primary_key=True, default=generate_uuid)
    policy_id = Column(String, ForeignKey("policies.policy_id"), nullable=False, index=True)
    section_code = Column(String, nullable=False)  # e.g. §3.1
    title = Column(String, nullable=False)
    category = Column(String, nullable=False)  # Clothing, Electronics, All, etc.
    policy_type = Column(String, nullable=False)  # return / warranty
    days_allowed = Column(Integer, nullable=False)
    condition_text = Column(Text, nullable=True)
    full_text = Column(Text, nullable=False)

    policy = relationship("StorePolicy", back_populates="sections")

class Order(Base):
    __tablename__ = "orders"
    
    order_id = Column(String, primary_key=True, index=True)
    shopper_id = Column(String, ForeignKey("shoppers.shopper_id"), nullable=False, index=True)
    status = Column(String, nullable=False)  # Delivered, Shipped, Out for Delivery, Processing
    tracking_number = Column(String, nullable=True)
    carrier = Column(String, nullable=True)
    estimated_delivery = Column(String, nullable=True)
    last_updated = Column(DateTime, default=datetime.utcnow)

    shopper = relationship("Shopper", back_populates="orders")

class CalculationResult(Base):
    __tablename__ = "calculation_results"
    
    calc_id = Column(String, primary_key=True, default=generate_uuid)
    receipt_id = Column(String, ForeignKey("receipts.receipt_id"), nullable=False, index=True)
    item_id = Column(String, ForeignKey("receipt_items.item_id"), nullable=False, index=True)
    
    purchase_date = Column(String, nullable=False)
    return_deadline = Column(String, nullable=False)
    return_days_remaining = Column(Integer, nullable=False)
    
    warranty_deadline = Column(String, nullable=True)
    warranty_days_remaining = Column(Integer, nullable=True)
    
    expiring_soon = Column(Boolean, nullable=False, default=False)
    status_label = Column(String, nullable=False)  # EXPIRING SOON, NORMAL, EXPIRED
    
    applicable_policy_section = Column(String, nullable=True)  # e.g. DemoMart Policy §3.1
    explanation = Column(Text, nullable=False)
    calculated_at = Column(DateTime, default=datetime.utcnow)

    receipt = relationship("Receipt", back_populates="calculations")
    item = relationship("ReceiptItem", back_populates="calculation")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    audit_id = Column(String, primary_key=True, default=generate_uuid)
    receipt_id = Column(String, ForeignKey("receipts.receipt_id"), nullable=True, index=True)
    shopper_id = Column(String, ForeignKey("shoppers.shopper_id"), nullable=False, index=True)
    stage = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    receipt = relationship("Receipt", back_populates="audit_logs")

class ReceiptDraft(Base):
    __tablename__ = "receipt_drafts"
    
    draft_id = Column(String, primary_key=True, default=generate_uuid)
    shopper_id = Column(String, ForeignKey("shoppers.shopper_id"), nullable=False, index=True)
    store = Column(String, nullable=False)
    store_address = Column(String, nullable=True)
    seller_name = Column(String, nullable=True)
    buyer_name = Column(String, nullable=True)
    sale_id = Column(String, nullable=True)
    invoice_number = Column(String, nullable=True)
    order_id = Column(String, nullable=True)
    purchase_date = Column(String, nullable=False)
    purchase_time = Column(String, nullable=True)
    customer_name = Column(String, nullable=True)
    payment_method = Column(String, nullable=True)
    currency = Column(String, default="₹")
    
    subtotal = Column(Float, nullable=True)
    discount_total = Column(Float, nullable=True)
    tax_total = Column(Float, nullable=True)
    shipping_charges = Column(Float, nullable=True)
    grand_total = Column(Float, nullable=True)
    amount_in_words = Column(String, nullable=True)
    printed_return_policy = Column(String, nullable=True)
    warranty_information = Column(String, nullable=True)
    
    filename = Column(String, nullable=True)
    file_path = Column(String, nullable=True)
    file_type = Column(String, nullable=True)
    raw_text = Column(Text, nullable=True)
    ocr_confidence = Column(Float, default=1.0)
    extraction_method = Column(String, default="native_pdf")
    validation_status = Column(String, default="Verified Math")
    status = Column(String, default="REVIEW_REQUIRED")  # REVIEW_REQUIRED, USER_EDITED, CONFIRMED
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    items = relationship("ReceiptItemDraft", back_populates="draft", cascade="all, delete-orphan")

class ReceiptItemDraft(Base):
    __tablename__ = "receipt_items_drafts"
    
    draft_item_id = Column(String, primary_key=True, default=generate_uuid)
    draft_id = Column(String, ForeignKey("receipt_drafts.draft_id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    sku = Column(String, nullable=True)
    asin = Column(String, nullable=True)
    item_code = Column(String, nullable=True)
    hsn = Column(String, nullable=True)
    category = Column(String, nullable=False)
    quantity = Column(Integer, default=1)
    unit_price = Column(Float, nullable=True)
    discount = Column(Float, nullable=True)
    discount_percent = Column(Float, nullable=True)
    discount_amount = Column(Float, nullable=True)
    tax = Column(Float, nullable=True)
    tax_rate = Column(Float, nullable=True)
    tax_type = Column(String, nullable=True)
    tax_amount = Column(Float, nullable=True)
    price = Column(Float, nullable=False)
    total_price = Column(Float, nullable=True)
    serial_number = Column(String, nullable=True)
    warranty_information = Column(String, nullable=True)
    warranty_days_if_explicit = Column(Integer, nullable=True)

    draft = relationship("ReceiptDraft", back_populates="items")
