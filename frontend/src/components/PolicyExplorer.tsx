import React from 'react';
import { BookOpen, CheckCircle2 } from 'lucide-react';

export const PolicyExplorer: React.FC = () => {
  const policies = [
    {
      store: 'DemoMart',
      title: 'DemoMart Return & Warranty Policy',
      sections: [
        {
          code: '§3.1',
          title: 'Clothing Returns',
          category: 'Clothing',
          type: 'Return Window',
          days: '30 Days',
          condition: 'Original tags must be attached for clothing returns.',
          full_text: 'Clothing items may be returned within 30 days of purchase for a full refund. Original tags must be attached.',
          relevance: 'Used to calculate Winter Jacket and Running Shoes return deadlines.'
        },
        {
          code: '§3.2',
          title: 'Electronics Returns',
          category: 'Electronics',
          type: 'Return Window',
          days: '15 Days',
          condition: 'Must include all original accessories and packaging.',
          full_text: 'Electronics items may be returned within 15 days of purchase in original packaging.',
          relevance: 'Used to calculate Laptop return deadline.'
        },
        {
          code: '§4.1',
          title: 'Electronics Warranty',
          category: 'Electronics',
          type: 'Manufacturer Warranty',
          days: '365 Days',
          condition: 'Covers hardware defects.',
          full_text: 'All electronics carry a 365-day manufacturer hardware warranty covering defects.',
          relevance: 'Used to calculate Laptop hardware warranty deadline.'
        },
        {
          code: '§5.1',
          title: 'Return Condition & Tags',
          category: 'All',
          type: 'Return Condition',
          days: 'Mandatory',
          condition: 'Original tags and proof of purchase required.',
          full_text: 'Original tags must be attached for clothing returns. Proof of purchase or receipt required.',
          relevance: 'Cited in proactive alert for Winter Jacket.'
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 border-b border-slate-200/80 pb-4">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Store Policy Explorer</h2>
          <p className="text-xs text-slate-500">Ground truth policy clauses used for deterministic window calculation</p>
        </div>
      </div>

      {policies.map((p, idx) => (
        <div key={idx} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-indigo-700 uppercase tracking-wider">{p.title}</h3>
            <span className="text-xs text-slate-500 font-mono">Store: {p.store}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {p.sections.map((sec, i) => (
              <div key={i} className="glass-card glass-card-hover rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/80 font-mono font-bold text-xs">
                      {sec.code}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{sec.title}</h4>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                    {sec.days}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed italic bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  "{sec.full_text}"
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center space-x-1.5 text-[11px] text-emerald-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>{sec.relevance}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
