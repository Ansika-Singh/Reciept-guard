import React, { useState } from 'react';
import {
  ShieldCheck,
  Calendar,
  FileCheck2,
  Search,
  Edit3,
  Archive,
  CheckCircle2,
  Calculator,
  Lock,
  Camera
} from 'lucide-react';

export interface MotionCardItem {
  id: string;
  quote: string;
  category: string;
  icon: 'shield' | 'calendar' | 'policy' | 'search' | 'edit' | 'archive' | 'check' | 'calc' | 'lock' | 'camera';
  accentColor: string;
}

const MOTION_CARDS: MotionCardItem[] = [
  {
    id: 'mc-1',
    quote: 'Return deadline visible instantly.',
    category: 'Return Protection',
    icon: 'calendar',
    accentColor: '#10b981',
  },
  {
    id: 'mc-2',
    quote: 'Exactly which policy clause applies?',
    category: 'Policy Transparency',
    icon: 'policy',
    accentColor: '#06b6d4',
  },
  {
    id: 'mc-3',
    quote: 'Receipt saved before I lose it.',
    category: 'Receipt Vault',
    icon: 'archive',
    accentColor: '#6366f1',
  },
  {
    id: 'mc-4',
    quote: 'Order status verified from the database.',
    category: 'Verified Lookup',
    icon: 'search',
    accentColor: '#f59e0b',
  },
  {
    id: 'mc-5',
    quote: 'I corrected the extracted date before saving.',
    category: 'Review & Confirm',
    icon: 'edit',
    accentColor: '#a855f7',
  },
  {
    id: 'mc-6',
    quote: 'Warranty evidence matched the purchase.',
    category: 'TrustGuard',
    icon: 'lock',
    accentColor: '#10b981',
  },
  {
    id: 'mc-7',
    quote: 'Calculated 30-day window down to the exact day.',
    category: 'Date Precision',
    icon: 'calc',
    accentColor: '#06b6d4',
  },
  {
    id: 'mc-8',
    quote: 'Extracted every line item from a phone photo.',
    category: 'Vision OCR',
    icon: 'camera',
    accentColor: '#6366f1',
  },
  {
    id: 'mc-9',
    quote: 'Zero hallucinations when an order was not found.',
    category: 'Truth Anchor',
    icon: 'check',
    accentColor: '#10b981',
  },
  {
    id: 'mc-10',
    quote: 'Original invoice preserved byte-for-byte in vault.',
    category: 'Binary Vault',
    icon: 'shield',
    accentColor: '#6366f1',
  },
];

function CardIcon({ type, color }: { type: MotionCardItem['icon']; color: string }) {
  const props = { className: 'w-3.5 h-3.5', style: { color } };
  switch (type) {
    case 'shield': return <ShieldCheck {...props} />;
    case 'calendar': return <Calendar {...props} />;
    case 'policy': return <FileCheck2 {...props} />;
    case 'search': return <Search {...props} />;
    case 'edit': return <Edit3 {...props} />;
    case 'archive': return <Archive {...props} />;
    case 'calc': return <Calculator {...props} />;
    case 'camera': return <Camera {...props} />;
    case 'lock': return <Lock {...props} />;
    default: return <CheckCircle2 {...props} />;
  }
}

interface CardProps {
  item: MotionCardItem;
  isHovered: boolean;
  onHover: (id: string | null) => void;
}

const LightMotionCard: React.FC<CardProps> = ({ item, isHovered, onHover }) => {
  return (
    <div
      onMouseEnter={() => onHover(item.id)}
      onMouseLeave={() => onHover(null)}
      className={`w-full rounded-2xl p-3.5 transition-all duration-300 select-none cursor-default ${
        isHovered
          ? 'bg-white text-slate-900 border-2 border-indigo-500 shadow-2xl shadow-indigo-500/25 scale-[1.05] z-30 translate-y-[-2px]'
          : 'bg-white/95 text-slate-900 border border-slate-200/90 shadow-lg shadow-black/35 hover:bg-white'
      }`}
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Card Header: Check / Icon + Small Badge */}
      <div className="flex items-center justify-between gap-1.5 mb-1.5">
        <div className="flex items-center space-x-1.5">
          <div className="w-5 h-5 rounded-lg bg-slate-100 flex items-center justify-center shadow-xs">
            <CardIcon type={item.icon} color={item.accentColor} />
          </div>
          <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500">
            Product Feedback
          </span>
        </div>
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: item.accentColor }}
        />
      </div>

      {/* Quote Text */}
      <p className="text-xs font-semibold text-slate-800 leading-snug">
        "{item.quote}"
      </p>

      {/* Card Footer: Category */}
      <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400 font-medium">
        <span className="text-indigo-600 font-bold">{item.category}</span>
        <span className="text-slate-400 uppercase tracking-wider">Demo</span>
      </div>
    </div>
  );
};

export const Background3DMotionWall: React.FC = () => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Distribute cards into 5 distinct columns
  const col1 = [MOTION_CARDS[0], MOTION_CARDS[4], MOTION_CARDS[7], MOTION_CARDS[2]];
  const col2 = [MOTION_CARDS[1], MOTION_CARDS[5], MOTION_CARDS[8], MOTION_CARDS[3]];
  const col3 = [MOTION_CARDS[2], MOTION_CARDS[6], MOTION_CARDS[9], MOTION_CARDS[0]];
  const col4 = [MOTION_CARDS[3], MOTION_CARDS[7], MOTION_CARDS[0], MOTION_CARDS[5]];
  const col5 = [MOTION_CARDS[4], MOTION_CARDS[8], MOTION_CARDS[1], MOTION_CARDS[6]];

  const columns = [
    {
      items: [...col1, ...col1, ...col1, ...col1],
      animationClass: 'animate-marquee-up',
      duration: '34s',
      colTransform: 'rotateY(-10deg) translateZ(-25px)',
      responsiveClass: 'hidden xl:flex',
    },
    {
      items: [...col2, ...col2, ...col2, ...col2],
      animationClass: 'animate-marquee-down',
      duration: '40s',
      colTransform: 'rotateY(-5deg) translateZ(8px)',
      responsiveClass: 'hidden md:flex',
    },
    {
      items: [...col3, ...col3, ...col3, ...col3],
      animationClass: 'animate-marquee-up',
      duration: '37s',
      colTransform: 'rotateY(0deg) translateZ(30px)',
      responsiveClass: 'flex',
    },
    {
      items: [...col4, ...col4, ...col4, ...col4],
      animationClass: 'animate-marquee-down',
      duration: '44s',
      colTransform: 'rotateY(5deg) translateZ(8px)',
      responsiveClass: 'flex',
    },
    {
      items: [...col5, ...col5, ...col5, ...col5],
      animationClass: 'animate-marquee-up',
      duration: '39s',
      colTransform: 'rotateY(10deg) translateZ(-25px)',
      responsiveClass: 'hidden lg:flex',
    },
  ];

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0 opacity-70"
    >
      {/* 3D Perspective Canvas */}
      <div
        className="w-full h-full flex justify-center items-center preserve-3d"
        style={{
          perspective: '1200px',
        }}
      >
        <div
          className="w-[115%] sm:w-[108%] max-w-7xl flex justify-center gap-3 sm:gap-5 preserve-3d"
          style={{
            transform: 'rotateX(14deg) rotateY(-8deg) rotateZ(5deg) scale(1.06)',
            transformStyle: 'preserve-3d',
          }}
        >
          {columns.map((col, colIdx) => (
            <div
              key={`bg-col-${colIdx}`}
              className={`flex-1 min-w-[170px] max-w-[230px] flex-col preserve-3d ${col.responsiveClass} pointer-events-auto`}
              style={{
                transform: col.colTransform,
                transformStyle: 'preserve-3d',
              }}
            >
              <div
                className={`flex flex-col space-y-3.5 ${col.animationClass}`}
                style={{
                  '--duration': col.duration,
                  animationPlayState: hoveredId ? 'paused' : undefined,
                } as React.CSSProperties}
              >
                {col.items.map((item, itemIdx) => (
                  <LightMotionCard
                    key={`bg-card-${colIdx}-${item.id}-${itemIdx}`}
                    item={item}
                    isHovered={hoveredId === item.id}
                    onHover={setHoveredId}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
