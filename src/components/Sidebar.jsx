import { LayoutDashboard, Receipt, Settings, PieChart, ShieldAlert } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'upload', label: 'Upload Receipt', icon: Receipt },
];

export default function Sidebar({ currentPage, onNavigate }) {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-surface border-r border-border py-6 flex-shrink-0" role="navigation" aria-label="Main navigation">
      
      <div className="px-6 mb-4">
        <p className="text-xs font-bold text-muted uppercase tracking-wider">Main Menu</p>
      </div>

      <nav className="flex flex-col gap-1 px-3">
        {NAV_ITEMS.map((item) => {
          const isActive = currentPage === item.id || (item.id === 'dashboard' && currentPage === 'review');
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`
                flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold
                transition-all cursor-pointer group
                ${isActive
                  ? 'text-white gradient-primary shadow-md'
                  : 'text-muted hover:bg-background hover:text-text-main'
                }
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              <item.icon size={20} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-primary transition-colors'} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto px-4">
        <div className="p-4 bg-background border border-border rounded-xl shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center">
              <ShieldAlert size={14} />
            </div>
            <p className="text-xs font-bold text-gray-900 dark:text-gray-100">AI Active</p>
          </div>
          <p className="text-[11px] text-muted leading-relaxed">
            ReceiptGuard is continuously auditing your expenses for duplicates.
          </p>
        </div>
      </div>
    </aside>
  );
}
