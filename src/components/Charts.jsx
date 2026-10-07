import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { CATEGORIES, CATEGORY_COLORS, formatINR } from '../lib/formatting.js';

/**
 * Modern Area Chart for Spending Over Time
 */
export function SpendingTimeBarChart({ receipts = [] }) {
  const data = useMemo(() => {
    if (!receipts.length) return [];
    const byDate = {};
    for (const r of receipts) {
      if (!r.date) continue;
      if (!byDate[r.date]) byDate[r.date] = 0;
      byDate[r.date] += Number(r.total) || 0;
    }
    const sortedDates = Object.keys(byDate).sort().slice(-14);
    return sortedDates.map(date => {
      const d = new Date(date);
      return {
        date,
        displayDate: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
        amount: byDate[date]
      };
    });
  }, [receipts]);

  if (!data.length) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-center text-muted">
        <p className="text-xs font-semibold">No timeline data available</p>
      </div>
    );
  }

  return (
    <div className="h-64 w-full relative -ml-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis 
            dataKey="displayDate" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 11, fill: '#64748B' }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 11, fill: '#64748B' }} 
            tickFormatter={(val) => `₹${val}`}
          />
          <RechartsTooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
            formatter={(value) => [formatINR(value), 'Spent']}
            labelStyle={{ color: '#64748B', marginBottom: '4px', fontSize: '12px' }}
          />
          <Area 
            type="monotone" 
            dataKey="amount" 
            stroke="#4F46E5" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorAmount)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Colorful Doughnut Chart for Category Breakdown
 */
export function CategoryDoughnutChart({ receipts = [] }) {
  const { data, total } = useMemo(() => {
    const totals = {};
    let sum = 0;
    CATEGORIES.forEach(cat => totals[cat] = 0);
    
    receipts.forEach(r => {
      const cat = r.category || r.suggestedCategory || 'Other';
      const amt = Number(r.total) || 0;
      if (totals[cat] !== undefined) totals[cat] += amt;
      else totals.Other += amt;
      sum += amt;
    });

    const active = CATEGORIES.filter(cat => totals[cat] > 0).map(cat => ({
      name: cat,
      value: totals[cat],
      color: CATEGORY_COLORS[cat]?.chart || '#94A3B8'
    })).sort((a, b) => b.value - a.value);

    return { data: active, total: sum };
  }, [receipts]);

  if (!data.length) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-center text-muted">
        <p className="text-xs font-semibold">No expense data to chart yet</p>
      </div>
    );
  }

  return (
    <div className="h-64 w-full relative">
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-20px]">
        <span className="text-xs text-muted font-bold tracking-widest uppercase">Total</span>
        <span className="text-xl font-extrabold text-gray-900 dark:text-white">{formatINR(total)}</span>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={90}
            paddingAngle={4}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <RechartsTooltip 
            formatter={(value) => formatINR(value)}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle"
            wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
