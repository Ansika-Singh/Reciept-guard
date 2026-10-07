export interface ReceiptItem {
  item_id: string;
  name: string;
  sku?: string | null;
  category: string;
  quantity: number;
  unit_price?: number | null;
  discount?: number | null;
  tax?: number | null;
  price: number;
  total_price?: number | null;
  serial_number?: string | null;
  warranty_days_if_explicit?: number | null;
}

export interface CalculationResult {
  calc_id: string;
  item_id: string;
  item_name: string;
  category: string;
  price: number;
  purchase_date: string;
  return_deadline: string;
  return_days_remaining: number;
  warranty_deadline?: string | null;
  warranty_days_remaining?: number | null;
  expiring_soon: boolean;
  status_label: 'EXPIRING SOON' | 'NORMAL' | 'EXPIRED';
  applicable_policy_section?: string | null;
  explanation: string;
}

export interface ExtractionDetails {
  extraction_method: string;
  ocr_confidence: number;
  confidence_level: string;
  is_arithmetic_valid: boolean;
  validation_warnings: string[];
  detected_fields: string[];
  missing_fields: string[];
  raw_text_preview: string;
}

export interface ReceiptInvoiceSection {
  id?: string | null;
  receipt_id?: string | null;
  page_number: number;
  section_type: 'marketplace_fee' | 'product_invoice' | 'restaurant_bill' | string;
  seller_name?: string | null;
  invoice_number?: string | null;
  invoice_date?: string | null;
  subtotal?: number | null;
  tax_total?: number | null;
  grand_total?: number | null;
  notes?: string | null;
}

export interface ProtectionSummary {
  receipt_id: string;
  store: string;
  store_address?: string | null;
  invoice_number?: string | null;
  order_id?: string | null;
  sale_id?: string | null;
  purchase_date: string;
  purchase_time?: string | null;
  customer_name?: string | null;
  payment_method?: string | null;
  currency: string;
  
  subtotal?: number | null;
  discount_total?: number | null;
  tax_total?: number | null;
  shipping_charges?: number | null;
  grand_total?: number | null;

  total_items: number;
  active_return_windows: number;
  active_warranties: number;
  expiring_soon_count: number;
  expiring_items: CalculationResult[];
  all_calculations: CalculationResult[];
  all_items: ReceiptItem[];
  invoice_sections?: ReceiptInvoiceSection[];
  alerts: string[];
  
  extraction_details?: ExtractionDetails | null;
}

export interface ChatSource {
  source_type: 'receipt_item' | 'policy' | 'order_database';
  title: string;
  reference: string;
  snippet: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  sources?: ChatSource[];
  timestamp: string;
}

export interface OrderStatusResult {
  found: boolean;
  order_id: string;
  shopper_id?: string | null;
  status?: string | null;
  tracking_number?: string | null;
  carrier?: string | null;
  estimated_delivery?: string | null;
  last_updated?: string | null;
  message: string;
}

export interface AuditLogEntry {
  audit_id: string;
  receipt_id?: string | null;
  shopper_id: string;
  stage: string;
  message: string;
  timestamp: string;
}

export interface ProcessingStage {
  id: string;
  label: string;
  description: string;
  status: 'pending' | 'processing' | 'complete' | 'error';
  percentage: number;
}

export interface ReceiptDraftItem {
  draft_item_id: string;
  draft_id: string;
  name: string;
  sku?: string | null;
  category: string;
  quantity: number;
  unit_price?: number | null;
  discount?: number | null;
  tax?: number | null;
  price: number;
  total_price?: number | null;
  serial_number?: string | null;
  warranty_days_if_explicit?: number | null;
}

export interface ReceiptDraft {
  draft_id: string;
  shopper_id: string;
  store: string;
  store_address?: string | null;
  seller_name?: string | null;
  buyer_name?: string | null;
  invoice_number?: string | null;
  order_id?: string | null;
  sale_id?: string | null;
  purchase_date: string;
  purchase_time?: string | null;
  customer_name?: string | null;
  payment_method?: string | null;
  currency: string;
  
  subtotal?: number | null;
  discount_total?: number | null;
  tax_total?: number | null;
  shipping_charges?: number | null;
  grand_total?: number | null;
  
  filename?: string | null;
  file_type?: string | null;
  preview_url?: string | null;
  raw_text?: string | null;
  ocr_confidence: number;
  extraction_method: string;
  validation_status: string;
  status: 'REVIEW_REQUIRED' | 'USER_EDITED' | 'CONFIRMED';
  
  created_at: string;
  updated_at?: string | null;
  
  items: ReceiptDraftItem[];
  invoice_sections?: ReceiptInvoiceSection[];
  extraction_details?: ExtractionDetails | null;
  preview_calculations: CalculationResult[];
}

export interface ReceiptDraftUpdate {
  store?: string;
  store_address?: string | null;
  seller_name?: string | null;
  buyer_name?: string | null;
  invoice_number?: string | null;
  order_id?: string | null;
  sale_id?: string | null;
  purchase_date?: string;
  purchase_time?: string | null;
  customer_name?: string | null;
  payment_method?: string | null;
  currency?: string;
  
  subtotal?: number | null;
  discount_total?: number | null;
  tax_total?: number | null;
  shipping_charges?: number | null;
  grand_total?: number | null;
  
  items?: Partial<ReceiptDraftItem>[];
}

export interface DraftRecalculateResponse {
  draft_id: string;
  is_arithmetic_valid: boolean;
  validation_status: string;
  validation_warnings: string[];
  subtotal?: number | null;
  grand_total?: number | null;
  preview_calculations: CalculationResult[];
}

export interface DraftConfirmResponse {
  receipt_id: string;
  status: string;
  message: string;
  summary: ProtectionSummary;
}

export interface ReceiptVaultCard {
  receipt_id: string;
  shopper_id: string;
  store: string;
  invoice_number?: string | null;
  order_id?: string | null;
  purchase_date: string;
  grand_total?: number | null;
  currency: string;
  
  original_filename?: string | null;
  file_type: 'pdf' | 'jpg' | 'png' | 'webp' | 'txt' | string;
  mime_type?: string | null;
  file_size?: number | null;
  
  status: 'CONFIRMED' | 'REVIEW_REQUIRED' | 'VERIFIED' | 'ARCHIVED' | string;
  extraction_status: string;
  verification_status: string;
  is_archived: boolean;
  
  total_items: number;
  active_return_windows: number;
  active_warranties: number;
  has_expiring_soon: boolean;
  expiring_soon_count: number;
  expiring_badge_text?: string | null;
  protection_status_label: 'Protected' | 'Review Required' | 'Expiring Soon' | string;
  
  items_preview: string[];
  
  file_view_url: string;
  file_download_url: string;
  confirmed_at?: string | null;
  created_at: string;
}

export interface ReceiptVaultListResponse {
  receipts: ReceiptVaultCard[];
  total_count: number;
  stores: string[];
  file_types: string[];
}

export interface VaultStats {
  total_receipts: number;
  protected_purchases: number;
  expiring_soon_count: number;
  total_purchase_value: number;
  currency: string;
}

export interface FullReceiptDetails {
  receipt_id: string;
  shopper_id: string;
  store: string;
  store_address?: string | null;
  seller_name?: string | null;
  buyer_name?: string | null;
  invoice_number?: string | null;
  order_id?: string | null;
  sale_id?: string | null;
  purchase_date: string;
  purchase_time?: string | null;
  customer_name?: string | null;
  payment_method?: string | null;
  currency: string;
  
  subtotal?: number | null;
  discount_total?: number | null;
  tax_total?: number | null;
  shipping_charges?: number | null;
  grand_total?: number | null;
  
  filename?: string | null;
  original_filename?: string | null;
  storage_key?: string | null;
  file_type?: string | null;
  mime_type?: string | null;
  file_size?: number | null;
  status: string;
  extraction_status: string;
  verification_status: string;
  is_archived: boolean;
  raw_text?: string | null;
  ocr_confidence: number;
  extraction_method: string;
  validation_status: string;
  
  file_view_url?: string;
  file_download_url?: string;
  
  created_at: string;
  confirmed_at?: string | null;
  items: ReceiptItem[];
  invoice_sections?: ReceiptInvoiceSection[];
  calculations: CalculationResult[];
}

export interface UserProfile {
  shopperId: string;
  name: string;
  email: string;
  role: string;
  avatarInitial: string;
  avatarBg: string;
  isDemo: boolean;
  tier: 'Protected Premium' | 'Verified Shopper' | 'Business Enterprise';
  description: string;
}

export const DEMO_USERS: UserProfile[] = [
  {
    shopperId: 'demo-shopper-001',
    name: 'Raj Soni',
    email: 'raj.soni@example.com',
    role: 'Principal Buyer',
    avatarInitial: 'RS',
    avatarBg: 'bg-indigo-600',
    isDemo: true,
    tier: 'Protected Premium',
    description: 'Pre-seeded vault: Amazon Kreo Keyboard, Caffix Cafe bill, Mangalam Designer invoice.',
  },
  {
    shopperId: 'demo-shopper-002',
    name: 'Ananya Sharma',
    email: 'ananya.sharma@example.com',
    role: 'Business Executive',
    avatarInitial: 'AS',
    avatarBg: 'bg-purple-600',
    isDemo: true,
    tier: 'Business Enterprise',
    description: 'Clean workspace session ready for custom receipt uploads and GST audits.',
  },
  {
    shopperId: 'demo-shopper-003',
    name: 'Marcus Vance',
    email: 'marcus.v@example.com',
    role: 'Hardware Analyst',
    avatarInitial: 'MV',
    avatarBg: 'bg-emerald-600',
    isDemo: true,
    tier: 'Verified Shopper',
    description: 'Tech enthusiast profile evaluating extended warranty and peripheral returns.',
  },
];
