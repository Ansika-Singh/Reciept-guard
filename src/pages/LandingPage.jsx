import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  ScanLine, 
  BrainCircuit, 
  TrendingUp, 
  ShieldAlert, 
  Download, 
  PieChart, 
  ChevronDown, 
  CheckCircle2, 
  ArrowRight,
  Sun,
  Moon
} from 'lucide-react';
import backgroundBg from '../image/background.jpg';

export default function LandingPage({ onLaunch }) {
  const [isDark, setIsDark] = useState(false);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  useEffect(() => {
    const isDarkMode = localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDark(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const stagger = {
    visible: { transition: { staggerChildren: 0.1 } }
  };

  return (
    <div className="min-h-screen font-sans overflow-x-hidden text-gray-900 dark:text-gray-100 relative">
      
      {/* Full-Screen Background Image */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat scale-[1.15] md:scale-[1.1]"
        style={{ backgroundImage: `url(${backgroundBg})` }}
      >
        {/* Darkening overlay for better text contrast */}
        <div className="absolute inset-0 bg-black/40 dark:bg-black/60"></div>
      </div>
      
      {/* Main Content Wrapper */}
      <div className="relative z-10">
      
      {/* Floating Navbar */}
      <div className="fixed top-6 w-full z-50 flex justify-center px-4">
        <nav className="w-full max-w-5xl glass-panel border border-white/20 dark:border-white/10 rounded-full py-3 px-6 md:px-8 flex justify-between items-center shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white shadow-sm">
              <ScanLine size={16} strokeWidth={2.5} />
            </div>
            <span className="font-extrabold text-lg tracking-tight">ReceiptGuard<span className="text-primary-light">.AI</span></span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-bold text-gray-600 dark:text-gray-300">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-primary transition-colors">How it Works</a>
            <button onClick={onLaunch} className="hover:text-primary transition-colors font-bold">Demo</button>
            <a href="#team" className="hover:text-primary transition-colors">Team</a>
          </div>
          <div className="flex items-center gap-4">
            {/* Professional Theme Toggle */}
            <button 
              onClick={toggleTheme} 
              className="relative w-14 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center p-1 transition-colors duration-300 shadow-inner"
              aria-label="Toggle Dark Mode"
            >
              <div className="absolute flex justify-between w-full px-2 left-0 z-0">
                <Moon size={12} className="text-gray-400" />
                <Sun size={12} className="text-yellow-400" />
              </div>
              <motion.div 
                className="w-5 h-5 rounded-full bg-white shadow-sm z-10 flex items-center justify-center"
                animate={{ x: isDark ? 28 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                {isDark ? <Moon size={10} className="text-gray-800" /> : <Sun size={10} className="text-yellow-500" />}
              </motion.div>
            </button>
            <button onClick={onLaunch} className="px-5 py-2 rounded-full gradient-primary text-white font-bold text-sm shadow-md hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2 group">
              Launch App
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </nav>
      </div>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 md:px-12 max-w-7xl mx-auto text-center relative">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="max-w-4xl mx-auto space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-500/20 text-white border border-primary-300/50 text-xs font-bold mb-4 shadow-md backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-100"></span>
            </span>
            CYRUS HACK-A-THON 2026
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
            Turn receipts into <br className="hidden md:block"/>
            <span className="gradient-text drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">financial intelligence.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            Stop manually entering data. Our vision AI instantly extracts, categorizes, and audits your expenses for duplicates and anomalies.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
            <button onClick={onLaunch} className="px-8 py-3.5 rounded-button gradient-primary text-white font-bold text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
              Get Started Now
            </button>
            <a href="#how-it-works" className="px-8 py-3.5 rounded-button bg-white/10 backdrop-blur-md text-white border border-white/20 font-bold text-base hover:bg-white/20 transition-all text-center shadow-lg">
              Watch Demo
            </a>
          </div>
        </motion.div>

        {/* Dashboard Mockup */}
        <motion.div 
          style={{ y }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-16 max-w-5xl mx-auto relative z-10 rounded-2xl overflow-hidden shadow-2xl border border-gray-200/50 dark:border-gray-700/50"
        >
          <div className="bg-black/60 p-3 flex items-center gap-2 border-b border-white/10">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-amber-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
           <div className="bg-black/40 backdrop-blur-xl p-4 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="md:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white">Overview</h3>
                    <p className="text-xs text-gray-300">Your spending this month</p>
                  </div>
                  <div className="px-3 py-1 bg-primary-500/30 text-white border border-primary-500/50 text-xs font-bold rounded-full">August 2026</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/10 border border-white/10 rounded-xl shadow-sm">
                    <p className="text-xs text-gray-300 uppercase font-bold tracking-wider mb-1">Total Spent</p>
                    <p className="text-2xl font-black text-white">₹ 42,500</p>
                    <p className="text-xs text-emerald-400 font-semibold mt-1">↓ 12% vs last month</p>
                  </div>
                  <div className="p-4 bg-amber-500/20 border border-amber-500/30 rounded-xl shadow-sm">
                    <p className="text-xs text-amber-300 uppercase font-bold tracking-wider mb-1">Requires Review</p>
                    <p className="text-2xl font-black text-amber-300">3 Items</p>
                    <p className="text-xs text-amber-200 font-semibold mt-1">Possible duplicates</p>
                  </div>
                </div>
                
                <div className="p-5 bg-white/10 border border-white/10 rounded-xl shadow-sm h-48 flex flex-col justify-between">
                  <p className="text-sm font-bold text-white mb-4">Spending Trends</p>
                  <div className="flex-1 flex items-end gap-2 pb-2">
                    {[40, 70, 45, 90, 65, 85, 30, 100, 55, 75, 40, 60].map((h, i) => (
                      <div key={i} className="flex-1 bg-white/20 rounded-t-sm" style={{ height: `${h}%` }}>
                        {i === 7 && <div className="w-full h-full bg-white rounded-t-sm shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>}
                      </div>
                    ))}
                  </div>
                </div>
             </div>
             
             <div className="space-y-6">
                <div className="p-5 bg-white/10 border border-white/10 rounded-xl shadow-sm">
                  <p className="text-sm font-bold text-white mb-4">Recent Receipts</p>
                  <div className="space-y-4">
                    {[
                      { m: 'Amazon India', a: '₹ 4,200', d: 'Today', c: 'bg-blue-500/30 text-blue-200' },
                      { m: 'Starbucks', a: '₹ 450', d: 'Yesterday', c: 'bg-emerald-500/30 text-emerald-200' },
                      { m: 'Uber Rides', a: '₹ 320', d: 'Aug 12', c: 'bg-purple-500/30 text-purple-200' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full ${item.c} flex items-center justify-center font-bold text-xs`}>
                            {item.m[0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white leading-tight">{item.m}</p>
                            <p className="text-[10px] text-gray-300">{item.d}</p>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-white">{item.a}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="p-5 bg-gradient-to-br from-indigo-500/80 to-purple-600/80 backdrop-blur-md rounded-xl shadow-md text-white border border-white/20">
                  <p className="text-xs font-bold uppercase tracking-wider mb-2 opacity-90">AI Insight</p>
                  <p className="text-sm font-semibold leading-relaxed drop-shadow-sm">
                    You have spent 40% more on Food & Dining this week. Consider setting a budget alert.
                  </p>
                </div>
             </div>
           </div>
        </motion.div>

        {/* Gradient Blob Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-light/20 dark:bg-primary-light/10 blur-[100px] rounded-full -z-10 pointer-events-none"></div>
      </section>

      {/* Trust & Stats */}
      <section className="border-y border-white/5 bg-black/40 dark:bg-black/60 backdrop-blur-md py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-extrabold text-white">95%</div>
            <div className="text-xs font-semibold text-gray-300 uppercase tracking-wider mt-1">Extraction Accuracy</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white">&lt; 3s</div>
            <div className="text-xs font-semibold text-gray-300 uppercase tracking-wider mt-1">Average Scan Time</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white">100%</div>
            <div className="text-xs font-semibold text-gray-300 uppercase tracking-wider mt-1">Offline Capable</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white">Zero</div>
            <div className="text-xs font-semibold text-gray-300 uppercase tracking-wider mt-1">Unnoticed Duplicates</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white drop-shadow-md">Intelligent Auditing, Out of the Box</h2>
          <p className="text-gray-200 text-lg drop-shadow-md">We don't just extract text. We analyze your spending patterns to save you money and catch errors.</p>
        </div>
        
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {[
            { icon: ScanLine, title: 'AI Receipt Scanning', desc: 'Powered by Gemini Flash and Groq Llama-3.2 Vision for instant, structured data extraction.', color: 'text-blue-300', bg: 'bg-blue-500/20' },
            { icon: ShieldAlert, title: 'Duplicate Detection', desc: 'Computes perceptual image hashes and checks merchant/amount/date to flag double entries.', color: 'text-amber-300', bg: 'bg-amber-500/20' },
            { icon: TrendingUp, title: 'Unusual Expense Alerts', desc: 'Flags transactions exceeding your historical category average by >2 standard deviations.', color: 'text-emerald-300', bg: 'bg-emerald-500/20' },
            { icon: BrainCircuit, title: 'Smart Categorization', desc: 'Automatically assigns the correct category based on merchant type and item details.', color: 'text-purple-300', bg: 'bg-purple-500/20' },
            { icon: PieChart, title: 'Spending Analytics', desc: 'Beautiful Recharts dashboards visualize your cash flow and top spending categories.', color: 'text-pink-300', bg: 'bg-pink-500/20' },
            { icon: Download, title: 'CSV Exports', desc: 'Instantly export your audited receipts into a clean CSV format for your accountant.', color: 'text-indigo-300', bg: 'bg-indigo-500/20' },
          ].map((feature, i) => (
            <motion.div key={i} variants={fadeInUp} className="p-6 flex flex-col items-start hover:-translate-y-1 transition-all bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.bg} ${feature.color} border border-white/10`}>
                <feature.icon size={24} />
              </div>
              <h3 className="text-lg font-bold mb-2 text-white">{feature.title}</h3>
              <p className="text-sm text-gray-300">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 px-6 md:px-12 bg-black/40 backdrop-blur-md border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white drop-shadow-md">How ReceiptGuard.AI Works</h2>
            <p className="text-gray-200 text-lg drop-shadow-md">Three simple steps to transform paper clutter into structured financial data.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center relative">
              <div className="w-16 h-16 mx-auto bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mb-6 shadow-lg shadow-primary/30 z-10 relative">1</div>
              <h3 className="text-xl font-bold mb-3 text-white">Snap or Upload</h3>
              <p className="text-gray-300">Take a photo with your phone or drop a file into the upload zone. We support receipts in any lighting condition.</p>
              {/* Connector line */}
              <div className="hidden md:block absolute top-8 left-[60%] w-full h-[2px] bg-gradient-to-r from-primary to-transparent -z-10 opacity-50"></div>
            </div>
            <div className="text-center relative">
              <div className="w-16 h-16 mx-auto bg-accent text-white rounded-full flex items-center justify-center text-2xl font-bold mb-6 shadow-lg shadow-accent/30 z-10 relative">2</div>
              <h3 className="text-xl font-bold mb-3 text-white">AI Extraction</h3>
              <p className="text-gray-300">Our advanced multi-modal vision models extract the merchant, date, total, and categorize the line items in milliseconds.</p>
              {/* Connector line */}
              <div className="hidden md:block absolute top-8 left-[60%] w-full h-[2px] bg-gradient-to-r from-accent to-transparent -z-10 opacity-50"></div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-emerald-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-6 shadow-lg shadow-emerald-500/30 relative">3</div>
              <h3 className="text-xl font-bold mb-3 text-white">Review &amp; Sync</h3>
              <p className="text-gray-300">Review the extracted data. Intelligent alerts will warn you if a duplicate is found or if the expense is unusually high.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white drop-shadow-md">Meet Team Pixel Pirates</h2>
          <p className="text-gray-200 text-lg drop-shadow-md">The builders behind ReceiptGuard.AI for the Cyrus Hack-A-Thon 2026.</p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-8">
          {/* Add team member cards here as needed */}
          <div className="p-6 text-center max-w-sm w-full hover:-translate-y-2 transition-transform duration-300 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary to-accent p-1 mb-4">
              <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">PP</span>
              </div>
            </div>
            <h3 className="text-xl font-bold text-white">Team Pixel Pirates</h3>
            <p className="text-primary-300 font-medium mb-3">Hackathon Innovators</p>
            <p className="text-sm text-gray-300">Passionate about building intuitive, AI-driven financial tools for the future.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-white drop-shadow-md">
            <ScanLine className="text-primary-300" size={24} />
            <span className="font-bold text-xl">ReceiptGuard<span className="text-primary-300">.AI</span></span>
          </div>
          <div className="text-sm text-gray-200 font-medium drop-shadow-md">
            Built by Team Pixel Pirates for Cyrus Hack-A-Thon 2026.
          </div>
          <div className="flex gap-4 drop-shadow-md">
            <button onClick={onLaunch} className="text-sm font-bold text-white hover:text-primary-300 transition-colors">Open App</button>
            <a href="https://github.com" className="text-sm font-bold text-white hover:text-gray-300 transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
