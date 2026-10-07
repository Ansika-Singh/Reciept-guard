import { useState, useRef, useEffect } from 'react';
import { Bell, Search, LayoutDashboard, Receipt, FileText, Settings, ShieldCheck, User, ChevronDown, LogOut, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PROFILES = [
  {
    id: 1,
    name: "Ansika Singh",
    role: "Pixel Pirates",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&q=80"
  },
  {
    id: 2,
    name: "Bishnu Sardar",
    role: "Lead Developer",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&q=80"
  },
  {
    id: 3,
    name: "Demo Judge",
    role: "Evaluator",
    avatar: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&q=80"
  }
];

export default function Header() {
  const [activeProfile, setActiveProfile] = useState(PROFILES[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-surface border-b border-border text-text-main h-16 sticky top-0 z-40">
      <div className="h-full px-4 md:px-8 flex items-center justify-between">
        
        {/* Left side */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white">
              <ShieldCheck size={18} />
            </div>
            <span className="font-bold text-lg tracking-tight hidden sm:block">ReceiptGuard</span>
          </div>
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-background border border-border rounded-lg text-sm text-muted focus-within:border-primary focus-within:ring-1 focus-within:ring-primary w-64 transition-all">
            <Search size={16} />
            <input type="text" placeholder="Search transactions..." className="bg-transparent border-none outline-none w-full" />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-5 relative">
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => {
                setIsNotifOpen(!isNotifOpen);
                setIsDropdownOpen(false);
              }}
              className={`relative p-1 transition-colors cursor-pointer ${isNotifOpen ? 'text-primary' : 'text-[#2d2a5d] dark:text-indigo-200 hover:text-primary'}`}
            >
              <Bell size={22} strokeWidth={2} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#f43f5e] rounded-full border-2 border-white dark:border-slate-900"></span>
            </button>

            <AnimatePresence>
              {isNotifOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-10 -right-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] dark:shadow-black/50 border border-gray-100 dark:border-gray-700 overflow-hidden z-50"
                >
                  <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/50">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">Notifications</p>
                    <span className="text-xs text-primary font-semibold cursor-pointer">Mark all read</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors bg-primary-50/30 dark:bg-primary-900/10">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <ShieldCheck size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">Duplicate Detected</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">We found a potential duplicate for your ₹4,200 Amazon receipt.</p>
                          <p className="text-[10px] text-primary font-bold">2 minutes ago</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <TrendingUp size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">Spending Alert</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Your Food & Dining expenses are 40% higher this week.</p>
                          <p className="text-[10px] text-gray-400 font-bold">1 hour ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="h-8 w-px bg-gray-200 dark:bg-gray-700"></div>
          
          <div className="relative" ref={dropdownRef}>
            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => {
                setIsDropdownOpen(!isDropdownOpen);
                setIsNotifOpen(false);
              }}
            >
              <div className="text-right hidden sm:block">
              <p className="text-[15px] font-semibold text-[#0a1b3f] dark:text-white leading-tight mb-0.5 group-hover:text-primary transition-colors">{activeProfile.name}</p>
              <p className="text-[13px] text-slate-500 font-medium leading-tight">{activeProfile.role}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full border border-white dark:border-gray-700 shadow-md overflow-hidden relative transition-transform group-hover:scale-105">
                <img 
                  src={activeProfile.avatar} 
                  alt={activeProfile.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <ChevronDown size={14} className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </div>
          </div>

          {/* Profile Dropdown */}
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-14 right-0 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] dark:shadow-black/50 border border-gray-100 dark:border-gray-700 overflow-hidden z-50"
              >
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-slate-900/50">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Switch Profile (Demo)</p>
                  <div className="space-y-2">
                    {PROFILES.map((profile) => (
                      <div 
                        key={profile.id}
                        onClick={() => {
                          setActiveProfile(profile);
                          setIsDropdownOpen(false);
                        }}
                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${activeProfile.id === profile.id ? 'bg-primary-50 dark:bg-primary-900/30 border border-primary-100 dark:border-primary-800/50' : 'hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                      >
                        <img src={profile.avatar} className="w-8 h-8 rounded-full object-cover" alt="" />
                        <div>
                          <p className={`text-sm font-semibold ${activeProfile.id === profile.id ? 'text-primary-dark dark:text-primary-light' : 'text-gray-700 dark:text-gray-200'}`}>{profile.name}</p>
                          <p className="text-xs text-gray-500">{profile.role}</p>
                        </div>
                        {activeProfile.id === profile.id && (
                          <div className="ml-auto w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-2">
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-danger-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        </div>
      </div>
    </header>
  );
}
