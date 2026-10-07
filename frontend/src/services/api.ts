import axios from 'axios';
import type {
  ProtectionSummary,
  ChatSource,
  OrderStatusResult,
  AuditLogEntry,
  ReceiptDraft,
  ReceiptDraftUpdate,
  DraftRecalculateResponse,
  DraftConfirmResponse
} from '../types';

const envApiUrl = import.meta.env.VITE_API_URL;
export const API_ORIGIN = envApiUrl
  ? envApiUrl.replace(/\/api\/?$/, '')
  : '';

export const API_BASE_URL = `${API_ORIGIN}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchHealth = async () => {
  const res = await api.get('/health');
  return res.data;
};

export const uploadReceipt = async (file: File, shopperId: string = 'demo-shopper-001'): Promise<ReceiptDraft> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('shopper_id', shopperId);

  const res = await api.post('/receipts/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const getReceiptDraft = async (draftId: string): Promise<ReceiptDraft> => {
  const res = await api.get(`/receipts/draft/${draftId}`);
  return res.data;
};

export const updateReceiptDraft = async (
  draftId: string,
  updateData: ReceiptDraftUpdate
): Promise<DraftRecalculateResponse> => {
  const res = await api.patch(`/receipts/draft/${draftId}`, updateData);
  return res.data;
};

export const confirmReceiptDraft = async (draftId: string): Promise<DraftConfirmResponse> => {
  const res = await api.post(`/receipts/draft/${draftId}/confirm`);
  return res.data;
};

export const seedDemoMode = async (shopperId: string = 'demo-shopper-001') => {
  const res = await api.post(`/receipts/demo-seed?shopper_id=${shopperId}`);
  return res.data;
};

export const getProtectionSummary = async (receiptId: string): Promise<ProtectionSummary> => {
  const res = await api.get(`/receipts/${receiptId}/summary`);
  return res.data;
};

export const sendChatMessage = async (
  shopperId: string,
  receiptId: string | null,
  question: string
): Promise<{ answer: string; sources: ChatSource[]; grounded: boolean }> => {
  const res = await api.post('/chat', {
    shopper_id: shopperId,
    receipt_id: receiptId,
    question,
  });
  return res.data;
};

export const lookupOrderStatus = async (
  orderId: string,
  shopperId: string = 'demo-shopper-001'
): Promise<OrderStatusResult> => {
  const res = await api.post('/orders/status', {
    order_id: orderId,
    shopper_id: shopperId,
  });
  return res.data;
};

export const getAuditLogs = async (receiptId: string): Promise<AuditLogEntry[]> => {
  const res = await api.get(`/audit/${receiptId}`);
  return res.data;
};

export const getReceiptVault = async (params: {
  shopper_id?: string;
  query?: string;
  store?: string;
  file_type?: string;
  status_filter?: string;
  sort_by?: string;
  include_archived?: boolean;
} = {}) => {
  const res = await api.get('/receipts/vault', {
    params: {
      shopper_id: params.shopper_id || 'demo-shopper-001',
      ...params
    }
  });
  return res.data;
};

export const getVaultStats = async (shopperId: string = 'demo-shopper-001') => {
  const res = await api.get(`/receipts/vault/stats?shopper_id=${shopperId}`);
  return res.data;
};

export const getReceiptDetails = async (receiptId: string) => {
  const res = await api.get(`/receipts/${receiptId}`);
  return res.data;
};

export const toggleArchiveReceipt = async (receiptId: string, shopperId: string = 'demo-shopper-001') => {
  const res = await api.post(`/receipts/${receiptId}/archive?shopper_id=${shopperId}`);
  return res.data;
};

export const deleteReceipt = async (receiptId: string, shopperId: string = 'demo-shopper-001') => {
  const res = await api.delete(`/receipts/${receiptId}?shopper_id=${shopperId}`);
  return res.data;
};

export const getReceiptFileUrl = (receiptId: string, shopperId: string = 'demo-shopper-001') => {
  return `${API_BASE_URL}/receipts/${receiptId}/file?shopper_id=${encodeURIComponent(shopperId)}`;
};

export const getReceiptDownloadUrl = (receiptId: string, shopperId: string = 'demo-shopper-001') => {
  return `${API_BASE_URL}/receipts/${receiptId}/download?shopper_id=${encodeURIComponent(shopperId)}`;
};

