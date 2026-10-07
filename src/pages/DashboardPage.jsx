import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  getReceipts,
  deleteReceipt,
  setAllReceipts,
  clearAllStorage,
  getDismissedAlerts,
  dismissAlert,
} from '../lib/storage.js';
import { auditAllReceipts } from '../lib/intelligence.js';
import { formatINR } from '../lib/formatting.js';
import { generateDemoTransactions } from '../data/demoData.js';
import { CategoryDoughnutChart, SpendingTimeBarChart } from '../components/Charts.jsx';
import TransactionTable from '../components/TransactionTable.jsx';
import AlertCard from '../components/AlertCard.jsx';
import { TrendingUp, TrendingDown, RefreshCw, Download, Plus, Lightbulb, ArrowUpRight, ArrowDownRight, Target, ShieldAlert } from 'lucide-react';

/**
 * DashboardPage component
 * Shows high-level financial metrics, category/temporal charts,
 * active AI-assisted review alerts, and full searchable transactions.
 */
export default function DashboardPage({ onUpload, onNavigate }) {
  const [receipts, setReceipts] = useState([]);
  const [dismissedAlerts, setDismissedAlerts] = useState([]);
  const [bannerMessage, setBannerMessage] = useState(null);

  // Refresh data from storage
  const reloadData = () => {
    const list = getReceipts();
    setReceipts(list);
    setDismissedAlerts(getDismissedAlerts());
  };

  useEffect(() => {
    reloadData();
  }, []);

  // Compute system-wide alerts across all current receipts
  const allAlerts = useMemo(() => {
    return auditAllReceipts(receipts);
  }, [receipts]);

  // Filter out alerts already marked as "Looks fine"
  const activeAlerts = useMemo(() => {
    return allAlerts.filter((a) => !dismissedAlerts.includes(a.id));
  }, [allAlerts, dismissedAlerts]);

  // Financial summary metrics
  const totalSpending = useMemo(() => {
    return receipts.reduce((sum, r) => sum + (Number(r.total) || 0), 0);
  }, [receipts]);

  const thisMonthSpending = useMemo(() => {
    const currentYearMonth = new Date().toISOString().substring(0, 7); // e.g. "2026-10"
    return receipts
      .filter((r) => (r.date || '').startsWith(currentYearMonth))
      .reduce((sum, r) => sum + (Number(r.total) || 0), 0);
  }, [receipts]);

  // Demo Tool Actions
  const handleLoadDemoData = () => {
    const seeded = generateDemoTransactions();
    setAllReceipts(seeded);
    reloadData();
    setBannerMessage({
      type: 'success',
      text: `Loaded ${seeded.length} realistic demo transactions! Baseline electronics purchases & Starbucks receipt seeded.`,
    });
    setTimeout(() => setBannerMessage(null), 5000);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all transaction records and dismissed alert states?')) {
      clearAllStorage();
      reloadData();
      setBannerMessage({
        type: 'info',
        text: 'All expense data and alert states have been reset.',
      });
      setTimeout(() => setBannerMessage(null), 4000);
    }
  };

  const handleDismissAlert = (alertId) => {
    dismissAlert(alertId);
    setDismissedAlerts(getDismissedAlerts());
  };

  const handleExportCSV = () => {
    if (receipts.length === 0) return;
    const headers = ['Date', 'Merchant', 'Category', 'Amount (INR)', 'Alerts'];
    const csvRows = [headers.join(',')];
    
    receipts.forEach(r => {
      const category = r.category || r.suggestedCategory || 'Other';
      const amt = r.total || 0;
      const rAlerts = allAlerts.filter(a => a.targetReceiptId === r.id || a.relatedReceiptId === r.id);
      const alertStr = rAlerts.length > 0 ? rAlerts.map(a => a.type).join(';') : 'Clean';
      
      const row = [
        r.date || '',
        `"${(r.merchant || '').replace(/"/g, '""')}"`,
        `"${category}"`,
        amt,
        `"${alertStr}"`
      ];
      csvRows.push(row.join(','));
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `expenses_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    setBannerMessage({ type: 'success', text: 'Expense report exported successfully!' });
    setTimeout(() => setBannerMessage(null), 3000);
  };

  const handleDeleteReceipt = (receiptId) => {
    if (window.confirm('Delete this transaction receipt?')) {
      deleteReceipt(receiptId);
      reloadData();
    }
  };

  const handleReviewReceipt = (receipt) => {
    onNavigate('review', {
      ...receipt,
      sourceMode: 'existing_edit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            Financial Dashboard
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Turn receipts into financial intelligence &middot; AI-assisted expense review
          </p>
        </div>

        {/* Demo Tools & Add Receipt */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleLoadDemoData}
            className="px-3 py-2 bg-surface text-primary border border-primary-100 hover:bg-primary-50 text-xs font-semibold rounded-button transition-smooth cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <RefreshCw size={14} />
            Load Demo Data
          </button>

          <button
            type="button"
            onClick={handleResetData}
            className="px-3 py-2 bg-surface text-gray-600 hover:text-danger border border-border hover:bg-danger-bg text-xs font-semibold rounded-button transition-smooth cursor-pointer"
          >
            Reset
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            disabled={receipts.length === 0}
            className="px-3 py-2 bg-surface text-success border border-success-border hover:bg-success-bg disabled:opacity-50 text-xs font-semibold rounded-button transition-smooth cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Download size={14} />
            Export CSV
          </button>

          <button
            type="button"
            onClick={onUpload}
            className="px-4 py-2 gradient-primary text-white hover:opacity-90 text-xs font-bold rounded-button transition-smooth cursor-pointer flex items-center gap-1.5 shadow-md"
          >
            <Plus size={14} strokeWidth={3} />
            Add Receipt
          </button>
        </div>
      </div>

      {/* Banner Notification */}
      {bannerMessage && (
        <div
          className={`p-3 rounded-lg text-xs font-semibold flex items-center justify-between transition-smooth ${
            bannerMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-blue-50 text-blue-800 border border-blue-200'
          }`}
        >
          <span>{bannerMessage.text}</span>
          <button onClick={() => setBannerMessage(null)} className="text-gray-500 hover:text-gray-800">
            &times;
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, staggerChildren: 0.1 }}
      >
        {/* Total Spending */}
        <motion.div className="card p-6 bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20 border-0 relative overflow-hidden" whileHover={{ scale: 1.02, y: -2 }}>
          {/* Decorative mesh/blob inside */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
          
          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-white/80">Total Spending</span>
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <span className="font-bold text-sm">₹</span>
            </div>
          </div>
          <div className="text-3xl font-black text-white relative z-10">
            {formatINR(totalSpending)}
          </div>
          <div className="flex items-center gap-1.5 mt-3 relative z-10">
            <div className="flex items-center gap-0.5 text-xs font-bold text-emerald-300 bg-emerald-900/40 px-2 py-0.5 rounded-full">
              <ArrowUpRight size={12} />
              +12%
            </div>
            <span className="text-xs text-white/70 ml-1">vs last month</span>
          </div>
        </motion.div>

        {/* This Month */}
        <motion.div className="card p-6 bg-gradient-to-br from-teal-400 to-emerald-500 text-white shadow-lg shadow-teal-500/20 border-0 relative overflow-hidden" whileHover={{ scale: 1.02, y: -2 }}>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>

          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-white/80">This Month</span>
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <Target size={18} />
            </div>
          </div>
          <div className="text-3xl font-black text-white relative z-10">
            {formatINR(thisMonthSpending)}
          </div>
          <div className="flex items-center gap-1.5 mt-3 relative z-10">
            <div className="flex items-center gap-0.5 text-xs font-bold text-white bg-white/20 px-2 py-0.5 rounded-full">
              <ArrowDownRight size={12} />
              -4%
            </div>
            <span className="text-xs text-white/70 ml-1">on track</span>
          </div>
        </motion.div>

        {/* Receipt Count */}
        <motion.div className="card p-6 bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/20 border-0 relative overflow-hidden" whileHover={{ scale: 1.02, y: -2 }}>
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>

          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-white/80">Receipts Stored</span>
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="text-3xl font-black text-white relative z-10">
            {receipts.length}
          </div>
          <div className="mt-4 w-full h-1.5 bg-white/20 rounded-full overflow-hidden relative z-10">
            <div className="h-full bg-white rounded-full" style={{ width: '60%' }}></div>
          </div>
          <p className="text-[10px] text-white/70 mt-1.5 text-right relative z-10 font-medium">60% of limit</p>
        </motion.div>

        {/* Items Requiring Review */}
        <motion.div className={`card p-6 border-0 relative overflow-hidden text-white shadow-lg transition-colors ${activeAlerts.length > 0 ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/20' : 'bg-surface border border-border text-gray-900 dark:text-white shadow-sm'}`} whileHover={{ scale: 1.02, y: -2 }}>
          {activeAlerts.length > 0 && <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>}

          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className={`text-xs font-bold uppercase tracking-wider ${activeAlerts.length > 0 ? 'text-white/90' : 'text-gray-500'}`}>Requires Review</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${activeAlerts.length > 0 ? 'bg-white/20 backdrop-blur-md text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
              <ShieldAlert size={18} />
            </div>
          </div>
          <div className={`text-3xl font-black relative z-10 ${activeAlerts.length > 0 ? 'text-white' : 'text-gray-400'}`}>
            {activeAlerts.length}
          </div>
          <p className={`text-xs font-bold mt-3 relative z-10 ${activeAlerts.length > 0 ? 'text-white' : 'text-gray-400'}`}>
            {activeAlerts.length === 1 ? '1 item requires attention' : `${activeAlerts.length} items require attention`}
          </p>
        </motion.div>
      </motion.div>

      {/* Active AI-Assisted Alerts Section */}
      {activeAlerts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                Items Requiring Review ({activeAlerts.length})
              </h3>
            </div>
            <span className="text-xs text-muted">
              AI-assisted detection &middot; Deterministic Explanations
            </span>
          </div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {activeAlerts.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <AlertCard
                  alert={alert}
                  onDismiss={handleDismissAlert}
                  onReview={(id) => {
                    const target = receipts.find((r) => r.id === id);
                    if (target) handleReviewReceipt(target);
                  }}
                  onDeleteDuplicate={(id) => handleDeleteReceipt(id)}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {/* Visual Analytics Charts: Category Doughnut & Spend Over Time Bar */}
      {receipts.length > 0 ? (
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {/* Spending Over Time Bar Chart */}
          <div className="lg:col-span-8 card p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Spending Trends</h3>
                <p className="text-xs text-muted">Daily expense timeline</p>
              </div>
            </div>
            <div className="flex-1 min-h-[250px]">
              <SpendingTimeBarChart receipts={receipts} />
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6 flex flex-col">
            {/* Spending by Category Doughnut Chart */}
            <div className="card p-6 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">Allocation</h3>
                  <p className="text-xs text-muted">Expenses by category</p>
                </div>
              </div>
              <div className="flex-1 min-h-[220px]">
                <CategoryDoughnutChart receipts={receipts} />
              </div>
            </div>

            {/* Smart Insights Card */}
            <div className="card p-6 gradient-primary text-white">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb size={18} className="text-accent-light" />
                <h3 className="text-sm font-bold tracking-wide uppercase">Smart Insights</h3>
              </div>
              <p className="text-sm leading-relaxed mb-4 text-white/90">
                Your highest spending category this month is <span className="font-bold text-accent-light">Electronics</span>. Consider setting a budget alert for this category.
              </p>
              <button className="text-xs font-bold bg-white/20 hover:bg-white/30 transition-colors px-3 py-1.5 rounded-lg w-full text-center">
                Configure Budgets
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        /* Empty State */
        <div className="card p-12 text-center border-2 border-dashed border-gray-200">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
              <path d="M8 7h8" />
              <path d="M8 11h8" />
              <path d="M8 15h5" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No receipts recorded yet</h3>
          <p className="text-sm text-muted mb-6 max-w-md mx-auto">
            Get started by uploading a receipt or click "Load Demo Data" to explore sample transactions and AI-assisted alerts.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleLoadDemoData}
              className="px-4 py-2.5 bg-white text-primary border border-primary text-xs font-bold rounded-lg hover:bg-primary-50 transition-smooth cursor-pointer"
            >
              Load Demo Data
            </button>
            <button
              onClick={onUpload}
              className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-mid transition-smooth cursor-pointer shadow-sm"
            >
              Upload First Receipt
            </button>
          </div>
        </div>
      )}

      {/* Full Searchable Transactions Table */}
      {receipts.length > 0 && (
        <motion.div 
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              Recorded Transactions ({receipts.length})
            </h3>
            <span className="text-xs text-muted">
              Search by merchant, category, date, or item
            </span>
          </div>

          <TransactionTable
            receipts={receipts}
            alerts={activeAlerts}
            onReviewReceipt={handleReviewReceipt}
            onDeleteReceipt={handleDeleteReceipt}
          />
        </motion.div>
      )}
    </div>
  );
}
