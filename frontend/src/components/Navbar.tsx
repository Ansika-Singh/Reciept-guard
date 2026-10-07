import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Activity, 
  BookOpen, 
  LogIn, 
  LogOut, 
  ChevronDown, 
  Users, 
  Check, 
  Zap,
  Lock
} from 'lucide-react';
import { DEMO_USERS, type UserProfile } from '../types';

interface NavbarProps {
  activeTab: 'dashboard' | 'vault' | 'policies' | 'audit' | 'how-it-works';
  setActiveTab: (tab: 'dashboard' | 'vault' | 'policies' | 'audit' | 'how-it-works') => void;
  onTryDemo?: () => void;
  onNavigateHome?: () => void;
  isProcessing?: boolean;
  isLanding?: boolean;
  currentUser: UserProfile | null;
  onOpenLoginModal: () => void;
  onSignOut: () => void;
  onSwitchUser: (user: UserProfile) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onNavigateHome,
  currentUser,
  onOpenLoginModal,
  onSignOut,
  onSwitchUser,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLogoClick = () => {
    if (onNavigateHome) {
      onNavigateHome();
    } else {
      setActiveTab('dashboard');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full transition-colors duration-300 border-b border-slate-200/80 bg-white/85 backdrop-blur-md text-slate-900 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Name - Tap to Navigate to Homepage */}
        <button
          type="button"
          onClick={handleLogoClick}
          className="flex items-center space-x-3 cursor-pointer group text-left focus:outline-hidden transition-transform duration-200 active:scale-95"
          title="Return to Homepage"
          aria-label="Return to Homepage"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:shadow-indigo-500/35 transition-all duration-200 group-hover:scale-105">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-indigo-950 transition-colors">
                Rupertrace
              </span>
            </div>
          </div>
        </button>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1 p-1 rounded-xl border bg-slate-100/90 border-slate-200/90">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('vault')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'vault'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Receipt Vault</span>
          </button>

          <button
            onClick={() => setActiveTab('policies')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'policies'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Policy Explorer</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'audit'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Audit Trail</span>
          </button>
        </nav>

        {/* User Session Profile & Sign In / Out */}
        <div className="flex items-center space-x-2.5 relative" ref={dropdownRef}>
          {currentUser ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl border bg-slate-50 hover:bg-slate-100/80 border-slate-200/80 text-slate-800 shadow-2xs transition-all cursor-pointer group"
                aria-haspopup="true"
                aria-expanded={isDropdownOpen}
              >
                <div className={`w-7 h-7 rounded-full ${currentUser.avatarBg} text-white flex items-center justify-center text-xs font-bold shadow-xs`}>
                  {currentUser.avatarInitial}
                </div>
                <div className="text-left text-xs hidden sm:block">
                  <div className="font-semibold leading-tight group-hover:text-indigo-950 flex items-center space-x-1">
                    <span>{currentUser.name}</span>
                    <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 border border-indigo-200/60 px-1 rounded">
                      Demo
                    </span>
                  </div>
                  <div className="text-[10px] text-emerald-600 font-medium flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Protected</span>
                  </div>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Interactive Profile & Session Dropdown */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-slate-200/90 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {/* Account Header */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 mb-2">
                    <div className="flex items-center space-x-2.5">
                      <div className={`w-9 h-9 rounded-xl ${currentUser.avatarBg} text-white flex items-center justify-center font-bold text-sm shadow-xs`}>
                        {currentUser.avatarInitial}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs text-slate-900 truncate">
                          {currentUser.name}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {currentUser.email}
                        </div>
                        <div className="text-[10px] font-mono text-indigo-600 mt-0.5">
                          ID: {currentUser.shopperId}
                        </div>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                      <span className="text-slate-500 flex items-center space-x-1">
                        <Lock className="w-3 h-3 text-emerald-600" />
                        <span>Isolated Vault Active</span>
                      </span>
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        Protected
                      </span>
                    </div>
                  </div>

                  {/* Switch Demo Accounts */}
                  <div className="px-2 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Switch Demo Account
                  </div>

                  <div className="space-y-1 mb-2">
                    {DEMO_USERS.map((user) => {
                      const isSelected = user.shopperId === currentUser.shopperId;
                      return (
                        <button
                          key={user.shopperId}
                          onClick={() => {
                            onSwitchUser(user);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full p-2 rounded-xl text-left text-xs transition-colors flex items-center justify-between ${
                            isSelected
                              ? 'bg-indigo-50 text-indigo-900 font-bold'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <div className={`w-5 h-5 rounded-full ${user.avatarBg} text-white text-[10px] font-bold flex items-center justify-center`}>
                              {user.avatarInitial}
                            </div>
                            <span className="truncate">{user.name}</span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Action Buttons */}
                  <div className="border-t border-slate-100 pt-1.5 space-y-1">
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onOpenLoginModal();
                      }}
                      className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center space-x-2 transition-colors text-left"
                    >
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      <span>Switch or Custom Login...</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onSignOut();
                      }}
                      className="w-full px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center space-x-2 transition-colors text-left"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-600" />
                      <span>Sign Out (Guest Mode)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onOpenLoginModal}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Demo Sign In</span>
              </button>

              <button
                type="button"
                onClick={onOpenLoginModal}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-slate-500" />
                <span>Sign In</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

