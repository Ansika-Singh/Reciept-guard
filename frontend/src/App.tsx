import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { UnifiedComposer } from './components/UnifiedComposer';
import { ProcessingTimeline } from './components/ProcessingTimeline';
import { DashboardMetrics } from './components/DashboardMetrics';
import { ProtectionSummary } from './components/ProtectionSummary';
import { ReviewDraftModal } from './components/ReviewDraftModal';
import { ReceiptVault } from './components/ReceiptVault';
import { RecentReceiptsWidget } from './components/RecentReceiptsWidget';
import { ChatPanel } from './components/ChatPanel';
import { OrderStatusCard } from './components/OrderStatusCard';
import { PolicyExplorer } from './components/PolicyExplorer';
import { AuditTimeline } from './components/AuditTimeline';
import { Minimal3DMotionField } from './components/Minimal3DMotionField';
import { BrandMarquee } from './components/BrandMarquee';
import { DemoLoginModal } from './components/DemoLoginModal';
import { 
  DEMO_USERS, 
  type UserProfile, 
  type ProtectionSummary as ProtectionSummaryType, 
  type ReceiptDraft 
} from './types';
import { 
  uploadReceipt, 
  getProtectionSummary, 
  getReceiptVault, 
  sendChatMessage 
} from './services/api';
import { 
  Lock, 
  Upload, 
  CheckCircle2, 
  FolderArchive, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Zap, 
  FileText, 
  Cpu, 
  Database,
  Calculator,
  Bot,
  MessageSquare,
  X,
  BookOpen
} from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'vault' | 'policies' | 'audit' | 'how-it-works'>('dashboard');
  
  // Interactive User Session Management
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('rupertrace_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return DEMO_USERS[0]; // Default to Raj Soni demo session
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const shopperId = currentUser?.shopperId || 'demo-shopper-001';

  const [currentReceiptId, setCurrentReceiptId] = useState<string | null>('rcpt-kreo-hive-75');
  const [summary, setSummary] = useState<ProtectionSummaryType | null>(null);
  
  const [activeDraft, setActiveDraft] = useState<ReceiptDraft | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [vaultRefreshTrigger, setVaultRefreshTrigger] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(0);

  // Grounded Assistant Response for Hero Composer
  const [composerResponse, setComposerResponse] = useState<{
    question: string;
    answer: string;
    sources: any[];
    timestamp: string;
  } | null>(null);
  const [isQueryLoading, setIsQueryLoading] = useState(false);

  // Automatically load initial vault receipt on mount
  useEffect(() => {
    loadReceiptSummary('rcpt-kreo-hive-75');
  }, [shopperId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const loadReceiptSummary = async (receiptId: string) => {
    try {
      const data = await getProtectionSummary(receiptId);
      setSummary(data);
      setCurrentReceiptId(receiptId);
    } catch (e) {
      console.error('Error loading receipt summary:', e);
      // Fallback: try first from vault
      loadFirstVaultReceipt();
    }
  };

  const triggerProcessingSimulation = async (receiptId: string) => {
    setIsProcessing(true);
    setProgressPercentage(15);

    const intervals = [35, 60, 80, 95, 100];
    for (const p of intervals) {
      await new Promise((resolve) => setTimeout(resolve, 250));
      setProgressPercentage(p);
    }

    try {
      const data = await getProtectionSummary(receiptId);
      setSummary(data);
      setCurrentReceiptId(receiptId);
      setVaultRefreshTrigger((prev) => prev + 1);
      showToast('Receipt securely saved to your Receipt Vault.');
    } catch (e) {
      console.error('Error fetching summary:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setProgressPercentage(25);
    try {
      const draft = await uploadReceipt(file, shopperId);
      setProgressPercentage(100);
      setIsProcessing(false);
      
      // Open Draft Review Modal
      setActiveDraft(draft);
      setIsReviewModalOpen(true);
    } catch (e) {
      console.error('Upload error:', e);
      setIsProcessing(false);
      showToast('Error uploading file. Please check format and try again.');
    }
  };

  const handleDraftConfirmed = async (receiptId: string) => {
    setIsReviewModalOpen(false);
    setActiveDraft(null);
    await triggerProcessingSimulation(receiptId);
  };

  const loadFirstVaultReceipt = async () => {
    try {
      const vaultRes = await getReceiptVault({ shopper_id: shopperId });
      if (vaultRes.receipts && vaultRes.receipts.length > 0) {
        const firstId = vaultRes.receipts[0].receipt_id;
        setCurrentReceiptId(firstId);
        const data = await getProtectionSummary(firstId);
        setSummary(data);
      }
    } catch (e) {
      console.error('Error loading vault receipt:', e);
    }
  };

  const loadFirstVaultReceiptForShopper = async (sId: string) => {
    try {
      const vaultRes = await getReceiptVault({ shopper_id: sId });
      if (vaultRes.receipts && vaultRes.receipts.length > 0) {
        const firstId = vaultRes.receipts[0].receipt_id;
        setCurrentReceiptId(firstId);
        const data = await getProtectionSummary(firstId);
        setSummary(data);
      } else {
        setSummary(null);
        setCurrentReceiptId(null);
      }
    } catch (e) {
      console.error('Error loading vault receipt:', e);
    }
  };

  const handleSelectUser = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem('rupertrace_user', JSON.stringify(user));
    setVaultRefreshTrigger((prev) => prev + 1);
    setComposerResponse(null);
    showToast(`Signed in as ${user.name} (${user.shopperId})`);
    loadFirstVaultReceiptForShopper(user.shopperId);
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    localStorage.removeItem('rupertrace_user');
    setSummary(null);
    setComposerResponse(null);
    showToast('Signed out to Guest Mode. Click Demo Sign In anytime.');
  };

  const handleAskReceiptGuard = (receiptId: string, _storeName: string) => {
    setCurrentReceiptId(receiptId);
    loadReceiptSummary(receiptId);
    setActiveTab('dashboard');
  };

  const handleQuickOrderCheck = async (orderId: string) => {
    setActiveTab('dashboard');
    handleUnifiedQuery(`Check status of order ${orderId}`);
  };

  const handleUnifiedQuery = async (queryText: string) => {
    setActiveTab('dashboard');
    setIsQueryLoading(true);
    setComposerResponse(null);
    try {
      const res = await sendChatMessage(shopperId, currentReceiptId, queryText);
      setComposerResponse({
        question: queryText,
        answer: res.answer,
        sources: res.sources || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      showToast('Verified response generated.');
    } catch (e) {
      console.error('Chat query error:', e);
      setComposerResponse({
        question: queryText,
        answer: "Unable to retrieve verified response right now. Please check if your question refers to a saved purchase or order number.",
        sources: [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } finally {
      setIsQueryLoading(false);
    }
  };

  const handleNavigateHome = () => {
    setActiveTab('dashboard');
    loadFirstVaultReceipt();
  };

  const sampleDemoReceipts = [
    { id: 'rcpt-kreo-hive-75', label: 'Amazon Kreo Keyboard', store: 'Amazon.in', price: '₹4,329', status: 'Expires in 4 days', badge: 'bg-amber-100 text-amber-800 border-amber-200' },
    { id: 'rcpt-caffix-tech-cafe', label: 'Caffix Tech Cafe', store: 'Phoenix Ventures', price: '₹2,136', status: 'Dine-In Bill', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    { id: 'rcpt-mangalam-designer', label: 'Mangalam Designer', store: 'Mangalam Pvt Ltd', price: '₹11,700', status: 'GST Tax Invoice', badge: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    { id: 'rcpt-rich-dad-poor-dad', label: 'Rich Dad Poor Dad', store: 'Amazon.in', price: '₹270', status: 'Book Supply Bill', badge: 'bg-slate-100 text-slate-800 border-slate-200' },
  ];

  return (
    <div className="font-sans min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col selection:bg-indigo-500/20 selection:text-indigo-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center space-x-2.5 px-4 py-3 rounded-xl bg-white border border-emerald-200 text-emerald-800 shadow-xl backdrop-blur-md animate-in slide-in-from-top-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onTryDemo={() => loadFirstVaultReceipt()}
        onNavigateHome={handleNavigateHome}
        isProcessing={isProcessing}
        isLanding={false}
        currentUser={currentUser}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onSignOut={handleSignOut}
        onSwitchUser={handleSelectUser}
      />

      {/* TAB: DASHBOARD (MAIN RICH SCROLLABLE EXPERIENCE) */}
      {activeTab === 'dashboard' && (
        <main className="flex-1 w-full flex flex-col">
          {/* HERO SECTION WITH 3D MOTION BACKGROUND & COMPOSER */}
          <section className="relative overflow-hidden bg-white border-b border-slate-200/80 pt-8 pb-14 px-4 sm:px-6 lg:px-8">
            {/* Background 3D Field */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-85">
              <Minimal3DMotionField />
            </div>

            {/* Radial Clear Gradient */}
            <div 
              className="absolute inset-0 z-1 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 35%, rgba(255,255,255,0.5) 70%, rgba(255,255,255,0.2) 100%)'
              }}
            />

            {/* Top Badge & Hero Content */}
            <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center text-center space-y-4 pt-2">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>CYRUS HACK-A-THON 2026 &middot; Problem Statement 03</span>
                <span className="text-indigo-400">•</span>
                <span className="text-indigo-800 font-bold">Team Pixel Pirates</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight max-w-3xl">
                Turn Every Receipt Into <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-cyan-600 bg-clip-text text-transparent">Financial Intelligence</span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
                Smart Receipt & Invoice Snapshot Auditor. Automatically extracts multi-rate GST, calculates deterministic return windows, tracks active warranties, and audits against duplicates without LLM hallucinations.
              </p>

              {/* Main Interactive Unified Composer & Real-time Assistant Response */}
              <div className="w-full max-w-2xl pt-2 space-y-3">
                <UnifiedComposer
                  onFileUpload={handleFileUpload}
                  onSendMessage={handleUnifiedQuery}
                  isProcessing={isProcessing}
                  onQuickOrderCheck={handleQuickOrderCheck}
                  shopperId={shopperId}
                  currentReceiptId={currentReceiptId}
                  theme="light"
                  showQuickChips={true}
                />

                {/* AI Agent Processing Indicator */}
                {isQueryLoading && (
                  <div className="w-full rounded-2xl bg-white border border-indigo-200/90 shadow-xl p-4 text-left flex items-center space-x-3.5 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0 animate-spin">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-indigo-950 flex items-center space-x-1.5">
                        <span>Rupertrace Grounded Agent Processing</span>
                        <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Auditing saved receipts, deterministic return windows, and store policies without hallucinating...
                      </p>
                    </div>
                  </div>
                )}

                {/* Grounded Assistant Answer Card */}
                {composerResponse && !isQueryLoading && (
                  <div className="w-full rounded-2xl bg-white border border-indigo-200/90 shadow-xl overflow-hidden text-left animate-in fade-in zoom-in-95 duration-200">
                    {/* Header */}
                    <div className="p-3.5 bg-gradient-to-r from-indigo-50/90 via-white to-slate-50 border-b border-indigo-100 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                          <Bot className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 tracking-tight">Rupertrace Verified Answer</span>
                          <span className="text-[10px] text-emerald-700 bg-emerald-100 font-semibold px-1.5 py-0.5 rounded ml-1.5">
                            Grounded Truth
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 text-xs">
                        <span className="text-[10px] text-slate-400">{composerResponse.timestamp}</span>
                        <button
                          onClick={() => setComposerResponse(null)}
                          className="w-6 h-6 rounded-lg hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                          title="Dismiss"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Question asked */}
                    <div className="px-4 pt-3 pb-2 bg-slate-50/50 border-b border-slate-100 flex items-start space-x-2 text-xs text-slate-600">
                      <span className="font-bold text-indigo-700 flex-shrink-0">Q:</span>
                      <span className="font-medium text-slate-800 italic">"{composerResponse.question}"</span>
                    </div>

                    {/* Answer Body */}
                    <div className="p-4 text-xs text-slate-800 leading-relaxed space-y-2 whitespace-pre-line max-h-64 overflow-y-auto">
                      {composerResponse.answer}
                    </div>

                    {/* Source Citations */}
                    {composerResponse.sources && composerResponse.sources.length > 0 && (
                      <div className="px-4 py-2.5 bg-slate-50/80 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-[10px]">
                        <span className="font-bold text-slate-500 mr-1 flex items-center space-x-1">
                          <BookOpen className="w-3 h-3 text-indigo-600" />
                          <span>Sources:</span>
                        </span>
                        {composerResponse.sources.map((src: any, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 font-medium shadow-2xs"
                          >
                            {src.title || src.reference}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Footer Actions */}
                    <div className="p-2.5 bg-white border-t border-slate-100 flex items-center justify-between text-xs">
                      <button
                        onClick={() => {
                          const chatElem = document.getElementById('assistant-chat');
                          if (chatElem) {
                            chatElem.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                        className="text-indigo-600 hover:text-indigo-800 font-bold text-[11px] flex items-center space-x-1 transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Continue Conversation in Assistant Chat &darr;</span>
                      </button>

                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => handleUnifiedQuery('When can I return my item?')}
                          className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold transition-colors cursor-pointer"
                        >
                          Check Deadlines
                        </button>
                        <button
                          onClick={() => handleUnifiedQuery('Check warranty details')}
                          className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold transition-colors cursor-pointer"
                        >
                          Check Warranty
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Fast Sample Receipt Switcher Chips */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
                <span className="text-xs font-semibold text-slate-500 flex items-center space-x-1 mr-1">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Inspect Pre-Seeded Receipts:</span>
                </span>
                {sampleDemoReceipts.map((rcpt) => {
                  const isSelected = currentReceiptId === rcpt.id;
                  return (
                    <button
                      key={rcpt.id}
                      onClick={() => loadReceiptSummary(rcpt.id)}
                      className={`text-xs px-3 py-1.5 rounded-xl border transition-all flex items-center space-x-2 shadow-2xs ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-md shadow-indigo-600/20 scale-105'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span>{rcpt.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${isSelected ? 'bg-indigo-700 text-indigo-100' : rcpt.badge}`}>
                        {rcpt.price}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 w-full max-w-3xl">
                <div className="flex items-center space-x-2 text-left bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/60 text-xs">
                  <Calculator className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-slate-800">Deterministic Math</div>
                    <div className="text-[10px] text-slate-500">Pure Python datetime logic</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-left bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/60 text-xs">
                  <FileText className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-slate-800">₹ INR & GST Ready</div>
                    <div className="text-[10px] text-slate-500">CGST, SGST & IGST breakdown</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-left bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/60 text-xs">
                  <Database className="w-4 h-4 text-cyan-600 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-slate-800">SQLite Order Truth</div>
                    <div className="text-[10px] text-slate-500">Zero order hallucinations</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-left bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/60 text-xs">
                  <ShieldCheck className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-slate-800">Shopper-Isolated</div>
                    <div className="text-[10px] text-slate-500">Encrypted vector storage</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* INFINITE BRAND MARQUEE (SHOWCASING MERCHANT POLICIES) */}
          <BrandMarquee />

          {/* SCROLLABLE LIVE DASHBOARD SUITE */}
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Processing Timeline Modal/View */}
            {isProcessing && (
              <div className="max-w-2xl mx-auto">
                <ProcessingTimeline
                  currentStage="CALCULATOR"
                  progressPercentage={progressPercentage}
                  stagesLog={[]}
                />
              </div>
            )}

            {/* LIVE DASHBOARD METRICS */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">Active Protection Overview</h2>
                  <p className="text-xs text-slate-500">Live indicators calculated from your current receipt snapshot and vault history</p>
                </div>
                <button
                  onClick={() => setActiveTab('vault')}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                >
                  <span>View All In Vault</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <DashboardMetrics summary={summary} />
            </div>

            {/* ACTIVE RECEIPT PROTECTION SUMMARY */}
            {summary && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs">
                  <div className="text-xs text-slate-600">
                    Currently inspecting: <span className="text-slate-900 font-bold">{summary.store}</span> ({summary.purchase_date}) &middot; Total: <span className="text-indigo-600 font-bold">{summary.currency}{summary.grand_total?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setActiveTab('vault')}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center space-x-1"
                    >
                      <FolderArchive className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Receipt Vault</span>
                    </button>

                    <label className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold transition-colors cursor-pointer flex items-center space-x-1">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload New Receipt</span>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.png,.jpg,.jpeg,.webp,.txt"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileUpload(e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* Protection Summary Card with Action Alerts & Calculations */}
                <ProtectionSummary summary={summary} />
              </div>
            )}

            {/* RECENT RECEIPTS IN VAULT SHOWCASE */}
            <div className="space-y-3">
              <RecentReceiptsWidget
                shopperId={shopperId}
                onViewAll={() => setActiveTab('vault')}
                refreshTrigger={vaultRefreshTrigger}
                onAskReceiptGuard={handleAskReceiptGuard}
              />
            </div>

            {/* TWO-COLUMN INTELLIGENCE SUITE: RAG CHAT & ORDER STATUS */}
            <div id="assistant-chat" className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2 scroll-mt-20">
              {/* Grounded RAG Chat Panel (2 Cols) */}
              <div className="lg:col-span-2">
                <ChatPanel 
                  shopperId={shopperId} 
                  receiptId={currentReceiptId} 
                  externalResponse={composerResponse}
                />
              </div>

              {/* Order Status Lookup & Trust Architecture (1 Col) */}
              <div className="lg:col-span-1 space-y-6">
                <OrderStatusCard shopperId={shopperId} />

                {/* Trust Architecture Card */}
                <div className="glass-card rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-3 bg-white">
                  <div className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center space-x-1.5">
                    <Lock className="w-4 h-4 text-indigo-600" />
                    <span>Trust Architecture</span>
                  </div>
                  <div className="space-y-2 text-xs text-slate-700">
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="text-slate-500">Vault Storage:</span>
                      <span className="font-semibold text-emerald-700">Original Binary Preserved</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="text-slate-500">AI Role:</span>
                      <span className="font-semibold text-indigo-700">OCR & Document Extraction</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="text-slate-500">Code Role:</span>
                      <span className="font-semibold text-emerald-700">Deterministic Arithmetic</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="text-slate-500">Database Role:</span>
                      <span className="font-semibold text-cyan-700">Relational Order Truth</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Chroma Role:</span>
                      <span className="font-semibold text-purple-700">Shopper-Isolated RAG</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* INTERACTIVE INGESTION PIPELINE WALKTHROUGH */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold uppercase tracking-wider">
                  <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                  <span>How Rupertrace Works</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  Deterministic Ingestion & Audit Pipeline
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Four synchronized layers ensure your purchase data is structured, verified, and protected against merchant expiration windows.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-sm">
                    1
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">Multi-Format Ingestion</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    PDF invoices and photo receipts are downscaled (1600px max) and fingerprinted with a 64-bit Average Perceptual Hash (aHash).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-sm">
                    2
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">Deterministic Date Math</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Return deadlines (<code className="bg-slate-200 px-1 rounded text-[11px]">purchase_date + policy_days</code>) are computed with zero LLM math hallucinations.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-black text-sm">
                    3
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">Duplicate & Anomaly Check</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Evaluates merchant Levenshtein string similarity (&ge; 0.8), amounts (&plusmn;₹0.01), and visual Hamming distance (&le; 5 bits).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-sm">
                    4
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">Shopper-Isolated RAG</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Chroma collections are strictly scoped per shopper (<code className="bg-slate-200 px-1 rounded text-[11px]">shopper_{shopperId}</code>) with SQLite order verification.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </main>
      )}

      {/* TAB: RECEIPT VAULT */}
      {activeTab === 'vault' && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <ReceiptVault
            shopperId={shopperId}
            onOpenUploader={() => setActiveTab('dashboard')}
            onAskReceiptGuard={handleAskReceiptGuard}
            refreshTrigger={vaultRefreshTrigger}
          />
        </main>
      )}

      {/* TAB: POLICY EXPLORER */}
      {activeTab === 'policies' && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <PolicyExplorer />
        </main>
      )}

      {/* TAB: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <AuditTimeline receiptId={currentReceiptId} />
        </main>
      )}

      {/* Review & Edit Draft Staging Modal */}
      {activeDraft && (
        <ReviewDraftModal
          draft={activeDraft}
          isOpen={isReviewModalOpen}
          onClose={() => {
            setIsReviewModalOpen(false);
            setActiveDraft(null);
          }}
          onConfirmed={handleDraftConfirmed}
        />
      )}

      {/* Interactive Demo Authentication & Session Switcher Modal */}
      <DemoLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentUser={currentUser}
        onSelectUser={handleSelectUser}
      />

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-8 mt-12 text-slate-500 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-sm">ReceiptGuard AI / Rupertrace</span>
                <span className="text-xs text-slate-500 block">Smart Receipt & Invoice Snapshot Auditor</span>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-xs font-semibold text-slate-600">
              <button onClick={() => setActiveTab('dashboard')} className="hover:text-indigo-600 transition-colors">Dashboard</button>
              <button onClick={() => setActiveTab('vault')} className="hover:text-indigo-600 transition-colors">Receipt Vault</button>
              <button onClick={() => setActiveTab('policies')} className="hover:text-indigo-600 transition-colors">Policy Explorer</button>
              <button onClick={() => setActiveTab('audit')} className="hover:text-indigo-600 transition-colors">Audit Trail</button>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <div>
              Built by <span className="font-bold text-slate-700">Team Pixel Pirates</span> for <span className="font-bold text-slate-700">CYRUS HACK-A-THON 2026</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Deterministic Math Engine • Shopper-Isolated Chroma DB • Multi-rate GST • SQLite Ground Truth
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
