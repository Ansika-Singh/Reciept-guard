import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  UserCheck, 
  ShieldCheck, 
  ArrowRight, 
  Mail, 
  KeyRound, 
  Check, 
  LogIn, 
  Zap
} from 'lucide-react';
import { DEMO_USERS, type UserProfile } from '../types';

interface DemoLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onSelectUser: (user: UserProfile) => void;
}

export const DemoLoginModal: React.FC<DemoLoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectUser,
}) => {
  const [activeTab, setActiveTab] = useState<'demo' | 'custom'>('demo');
  const [customName, setCustomName] = useState('Alex Morgan');
  const [customEmail, setCustomEmail] = useState('alex.morgan@demo.ai');
  const [customPassword, setCustomPassword] = useState('••••••••••••');

  if (!isOpen) return null;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customEmail.trim()) return;

    const initial = customName.trim().charAt(0).toUpperCase() || 'U';
    const slug = customName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 15);
    const customProfile: UserProfile = {
      shopperId: `shopper-${slug || 'custom'}-${Date.now().toString().slice(-4)}`,
      name: customName.trim(),
      email: customEmail.trim(),
      role: 'Custom Demo Shopper',
      avatarInitial: initial,
      avatarBg: 'bg-indigo-600',
      isDemo: true,
      tier: 'Verified Shopper',
      description: 'Custom session with isolated encrypted receipt vault and policy auditor.',
    };

    onSelectUser(customProfile);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="relative p-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Instant Demo Session</span>
          </div>

          <h2 className="text-2xl font-black tracking-tight text-white">
            Sign In to Rupertrace
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-md">
            Test full receipt ingestion, grounded RAG assistant, and multi-tenant shopper vault isolation without credit card or registration.
          </p>

          {/* Toggle Tabs */}
          <div className="flex space-x-2 mt-5 p-1 rounded-xl bg-white/10 border border-white/10 text-xs font-medium">
            <button
              onClick={() => setActiveTab('demo')}
              className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                activeTab === 'demo'
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>1-Click Demo Profiles</span>
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                activeTab === 'custom'
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Custom Sign In</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {activeTab === 'demo' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
                <span>Select a Demo Account:</span>
                <span className="text-[11px] text-indigo-600">Zero Setup Required</span>
              </div>

              {DEMO_USERS.map((user) => {
                const isActive = currentUser?.shopperId === user.shopperId;
                return (
                  <button
                    key={user.shopperId}
                    onClick={() => {
                      onSelectUser(user);
                      onClose();
                    }}
                    className={`w-full p-4 rounded-2xl border text-left transition-all duration-200 flex items-start space-x-3.5 cursor-pointer relative group ${
                      isActive
                        ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 shadow-md shadow-indigo-600/10'
                        : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50/80 bg-white'
                    }`}
                  >
                    {/* User Avatar */}
                    <div className={`w-10 h-10 rounded-2xl ${user.avatarBg} text-white font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5`}>
                      {user.avatarInitial}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-900">
                          {user.name}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          {user.tier}
                        </span>
                        {isActive && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center space-x-1">
                            <Check className="w-2.5 h-2.5 text-emerald-700" />
                            <span>Active</span>
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-500 font-medium mt-0.5">
                        {user.email} &middot; <code className="text-[11px] bg-slate-100 px-1 rounded text-slate-600">{user.shopperId}</code>
                      </div>

                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {user.description}
                      </p>
                    </div>

                    <div className="flex-shrink-0 pt-2 text-slate-400 group-hover:text-indigo-600 transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="shopper@example.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password (Demo pre-filled)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={customPassword}
                    onChange={(e) => setCustomPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center space-x-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Start Session as {customName || 'User'}</span>
              </button>
            </form>
          )}

          {/* Privacy & Guarantee Footer */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Multi-tenant shopper isolation active</span>
            </span>
            <span className="font-mono text-[10px] text-slate-400">Zero Cloud Leak</span>
          </div>
        </div>
      </div>
    </div>
  );
};
