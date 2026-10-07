import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileText, 
  Image as ImageIcon, 
  FileCode,
  Search, 
  Download, 
  ExternalLink, 
  Eye, 
  MoreVertical, 
  Trash2, 
  Archive, 
  ArchiveRestore,
  ShieldCheck, 
  AlertTriangle, 
  Plus, 
  RefreshCw,
  Sparkles
} from 'lucide-react';
import type { ReceiptVaultCard, VaultStats } from '../types';
import { 
  getReceiptVault, 
  getVaultStats, 
  toggleArchiveReceipt, 
  deleteReceipt, 
  getReceiptFileUrl, 
  getReceiptDownloadUrl 
} from '../services/api';
import { ReceiptDetailModal } from './ReceiptDetailModal';

interface ReceiptVaultProps {
  shopperId?: string;
  onOpenUploader: () => void;
  onAskReceiptGuard?: (receiptId: string, storeName: string) => void;
  refreshTrigger?: number;
}

export const ReceiptVault: React.FC<ReceiptVaultProps> = ({
  shopperId = 'demo-shopper-001',
  onOpenUploader,
  onAskReceiptGuard,
  refreshTrigger = 0
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [receipts, setReceipts] = useState<ReceiptVaultCard[]>([]);
  const [stats, setStats] = useState<VaultStats | null>(null);
  const [stores, setStores] = useState<string[]>([]);
  const [fileTypes, setFileTypes] = useState<string[]>([]);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStore, setSelectedStore] = useState<string>('All Stores');
  const [selectedFileType, setSelectedFileType] = useState<string>('All Types');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Active modal state
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [receiptToDelete, setReceiptToDelete] = useState<ReceiptVaultCard | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchVaultData = useCallback(async () => {
    setLoading(true);
    try {
      const [vaultRes, statsRes] = await Promise.all([
        getReceiptVault({
          shopper_id: shopperId,
          query: searchQuery.trim() || undefined,
          store: selectedStore !== 'All Stores' ? selectedStore : undefined,
          file_type: selectedFileType !== 'All Types' ? selectedFileType : undefined,
          status_filter: statusFilter,
          sort_by: sortBy,
          include_archived: statusFilter === 'archived'
        }),
        getVaultStats(shopperId)
      ]);

      setReceipts(vaultRes.receipts || []);
      setStores(vaultRes.stores || []);
      setFileTypes(vaultRes.file_types || []);
      setStats(statsRes);
    } catch (err) {
      console.error('Failed to load Receipt Vault:', err);
    } finally {
      setLoading(false);
    }
  }, [shopperId, searchQuery, selectedStore, selectedFileType, statusFilter, sortBy]);

  useEffect(() => {
    fetchVaultData();
  }, [fetchVaultData, refreshTrigger]);

  const handleToggleArchive = async (receiptId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMenuId(null);
    try {
      await toggleArchiveReceipt(receiptId, shopperId);
      fetchVaultData();
    } catch (err) {
      console.error('Failed to toggle archive:', err);
    }
  };

  const handleConfirmDelete = async () => {
    if (!receiptToDelete) return;
    setIsDeleting(true);
    try {
      await deleteReceipt(receiptToDelete.receipt_id, shopperId);
      setReceiptToDelete(null);
      fetchVaultData();
    } catch (err) {
      console.error('Failed to delete receipt:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatCurrency = (val?: number | null, curr: string = '₹') => {
    if (val === undefined || val === null) return `${curr}0.00`;
    return `${curr}${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getFileIcon = (fileType: string) => {
    const ft = (fileType || '').toLowerCase();
    if (ft === 'pdf') return <FileText className="w-6 h-6 text-rose-400" />;
    if (['jpg', 'jpeg', 'png', 'webp'].includes(ft)) return <ImageIcon className="w-6 h-6 text-emerald-400" />;
    return <FileCode className="w-6 h-6 text-indigo-400" />;
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/80">
              Document Vault
            </span>
            <span className="text-xs text-slate-500 font-medium">Permanent Storage</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">RECEIPT VAULT</h1>
          <p className="text-sm text-slate-500">
            Your saved purchases and original documents, protected in one secure place.
          </p>
        </div>

        <div className="flex items-center space-x-3 relative z-10">
          <button
            onClick={fetchVaultData}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
            title="Refresh Vault"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onOpenUploader}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm hover:shadow-md transition transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Receipt</span>
          </button>
        </div>
      </div>

      {/* Vault Statistics Top Bar */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Receipts</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{stats.total_receipts}</p>
            </div>
            <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
              <FileText className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Protected Purchases</p>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">{stats.protected_purchases}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          <div className={`p-4 rounded-xl border shadow-xs flex items-center justify-between transition ${
            stats.expiring_soon_count > 0 
              ? 'bg-amber-50/60 border-amber-200' 
              : 'bg-white border-slate-200/90'
          }`}>
            <div>
              <p className="text-xs text-slate-500 font-medium">Expiring Soon</p>
              <p className={`text-2xl font-extrabold mt-1 ${stats.expiring_soon_count > 0 ? 'text-amber-600' : 'text-slate-700'}`}>
                {stats.expiring_soon_count}
              </p>
            </div>
            <div className={`p-3 rounded-xl border ${
              stats.expiring_soon_count > 0 
                ? 'bg-amber-100/80 border-amber-200 text-amber-600' 
                : 'bg-slate-100 border-slate-200 text-slate-500'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Purchase Value</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">
                {formatCurrency(stats.total_purchase_value, stats.currency)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search store, invoice, order ID, product name, or file..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Store Filter */}
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-indigo-500 transition"
            >
              <option value="All Stores">All Stores</option>
              {stores.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* File Type Filter */}
            <select
              value={selectedFileType}
              onChange={(e) => setSelectedFileType(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-indigo-500 transition uppercase"
            >
              <option value="All Types">All Types</option>
              {fileTypes.map((ft) => (
                <option key={ft} value={ft}>{ft.toUpperCase()}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-indigo-500 transition"
            >
              <option value="all">All Statuses</option>
              <option value="protected">Protected</option>
              <option value="expiring_soon">Expiring Soon ⚠</option>
              <option value="archived">Archived</option>
            </select>

            {/* Sort Options */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-indigo-500 transition"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="highest_total">Sort: Highest Total</option>
              <option value="lowest_total">Sort: Lowest Total</option>
              <option value="expiring_soon">Sort: Expiring Soon</option>
            </select>

          </div>
        </div>
      </div>

      {/* Receipts Grid / List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-xs text-slate-500">Loading your protected documents...</p>
        </div>
      ) : receipts.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-2xs">
            <FileText className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-slate-900">No saved receipts yet.</h3>
            <p className="text-xs text-slate-500">
              Upload your first receipt and Rupertrace will protect the details that matter.
            </p>
          </div>
          <button
            onClick={onOpenUploader}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm hover:shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Receipt</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {receipts.map((card) => {
            const fileUrl = getReceiptFileUrl(card.receipt_id, shopperId);
            const downloadUrl = getReceiptDownloadUrl(card.receipt_id, shopperId);

            return (
              <div
                key={card.receipt_id}
                onClick={() => setSelectedReceiptId(card.receipt_id)}
                className="group relative p-5 rounded-2xl bg-white hover:bg-slate-50/50 border border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-md transition flex flex-col justify-between cursor-pointer"
              >
                <div>
                  {/* Top Bar: Icon + Store + Badges */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 group-hover:border-slate-300 transition">
                        {getFileIcon(card.file_type)}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition">
                          {card.store}
                        </h3>
                        <p className="text-[11px] text-slate-500 font-mono">
                          {card.invoice_number ? `Inv #${card.invoice_number}` : card.order_id ? `Order #${card.order_id}` : card.purchase_date}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                        {card.file_type}
                      </span>
                      
                      {/* More Options Dropdown */}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === card.receipt_id ? null : card.receipt_id);
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {activeMenuId === card.receipt_id && (
                          <div 
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 mt-1 w-44 rounded-xl bg-white border border-slate-200 shadow-xl z-30 py-1 text-xs animate-in fade-in zoom-in-95 duration-150"
                          >
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                setSelectedReceiptId(card.receipt_id);
                              }}
                              className="w-full px-3 py-2 text-left text-slate-700 hover:text-slate-900 hover:bg-slate-50 flex items-center space-x-2"
                            >
                              <Eye className="w-3.5 h-3.5 text-indigo-600" />
                              <span>View Details</span>
                            </button>
                            <a
                              href={downloadUrl}
                              download={card.original_filename || 'receipt'}
                              onClick={() => setActiveMenuId(null)}
                              className="w-full px-3 py-2 text-left text-slate-700 hover:text-slate-900 hover:bg-slate-50 flex items-center space-x-2 block"
                            >
                              <Download className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Download Original</span>
                            </a>
                            <button
                              onClick={(e) => handleToggleArchive(card.receipt_id, e)}
                              className="w-full px-3 py-2 text-left text-slate-700 hover:text-slate-900 hover:bg-slate-50 flex items-center space-x-2"
                            >
                              {card.is_archived ? (
                                <>
                                  <ArchiveRestore className="w-3.5 h-3.5 text-blue-600" />
                                  <span>Restore to Active</span>
                                </>
                              ) : (
                                <>
                                  <Archive className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Archive Receipt</span>
                                </>
                              )}
                            </button>
                            <div className="border-t border-slate-100 my-1" />
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                setReceiptToDelete(card);
                              }}
                              className="w-full px-3 py-2 text-left text-rose-600 hover:text-rose-700 hover:bg-rose-50 flex items-center space-x-2"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete Receipt</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Summary row */}
                  <div className="flex items-center justify-between mt-4 text-xs">
                    <span className="text-slate-500">
                      {card.purchase_date} • {card.total_items} {card.total_items === 1 ? 'item' : 'items'}
                    </span>
                    <span className="font-extrabold text-sm font-mono text-emerald-600">
                      {formatCurrency(card.grand_total, card.currency)}
                    </span>
                  </div>

                  {/* Items Preview */}
                  {card.items_preview && card.items_preview.length > 0 && (
                    <p className="text-[11px] text-slate-500 mt-2 line-clamp-1 italic">
                      {card.items_preview.join(', ')}
                    </p>
                  )}

                  {/* Expiring Alert Badge */}
                  {card.expiring_badge_text && (
                    <div className="mt-3 inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-bold">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                      <span>⚠ {card.expiring_badge_text}</span>
                    </div>
                  )}
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1 text-slate-500">
                    {card.has_expiring_soon ? (
                      <span className="text-amber-600 font-medium">Review Active</span>
                    ) : (
                      <span className="text-emerald-600 font-medium flex items-center space-x-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Protected</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedReceiptId(card.receipt_id);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                    >
                      View
                    </button>
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                      title="Open Original Document"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Receipt Detail Modal */}
      {selectedReceiptId && (
        <ReceiptDetailModal
          receiptId={selectedReceiptId}
          shopperId={shopperId}
          onClose={() => setSelectedReceiptId(null)}
          onAskReceiptGuard={onAskReceiptGuard}
        />
      )}

      {/* Delete Confirmation Modal */}
      {receiptToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-100">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Delete Saved Receipt?</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete this receipt for <strong className="text-slate-900">{receiptToDelete.store}</strong> ({receiptToDelete.original_filename || 'document'})?
              All associated protection calculations and stored files will be permanently purged.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                disabled={isDeleting}
                onClick={() => setReceiptToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition flex items-center space-x-1.5"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Receipt</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
