import React from 'react';
import { Package, Clock, ShieldCheck, AlertTriangle } from 'lucide-react';
import type { ProtectionSummary } from '../types';

interface DashboardMetricsProps {
  summary: ProtectionSummary | null;
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ summary }) => {
  const totalItems = summary ? summary.total_items : 0;
  const activeReturns = summary ? summary.active_return_windows : 0;
  const activeWarranties = summary ? summary.active_warranties : 0;
  const expiringSoon = summary ? summary.expiring_soon_count : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {/* Total Items */}
      <div className="glass-card rounded-2xl p-4 border border-slate-200/90 shadow-xs flex items-center space-x-4">
        <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
          <Package className="w-6 h-6" />
        </div>
        <div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{totalItems}</div>
          <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total Items</div>
        </div>
      </div>

      {/* Active Return Windows */}
      <div className="glass-card rounded-2xl p-4 border border-slate-200/90 shadow-xs flex items-center space-x-4">
        <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600">
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{activeReturns}</div>
          <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Active Returns</div>
        </div>
      </div>

      {/* Active Warranties */}
      <div className="glass-card rounded-2xl p-4 border border-slate-200/90 shadow-xs flex items-center space-x-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <div className="text-2xl font-extrabold text-emerald-600 tracking-tight">{activeWarranties}</div>
          <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Active Warranties</div>
        </div>
      </div>

      {/* Expiring Soon */}
      <div className={`glass-card rounded-2xl p-4 border shadow-xs flex items-center space-x-4 transition-all ${
        expiringSoon > 0
          ? 'border-amber-200 bg-amber-50/50 glow-amber'
          : 'border-slate-200/90'
      }`}>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
          expiringSoon > 0 ? 'bg-amber-100 border-amber-200 text-amber-600 font-bold' : 'bg-slate-100 border-slate-200 text-slate-500'
        }`}>
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <div className={`text-2xl font-extrabold tracking-tight ${expiringSoon > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
            {expiringSoon}
          </div>
          <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Expiring Soon</div>
        </div>
      </div>
    </div>
  );
};
