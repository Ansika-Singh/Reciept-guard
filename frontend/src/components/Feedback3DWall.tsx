import React, { useState } from 'react';
import {
  Shield,
  Calendar,
  FileCheck2,
  Search,
  Edit3,
  Archive,
  Bell,
  Scan,
  Calculator,
  Sparkles,
  MessageSquare,
  Eye,
  Download,
  AlertTriangle,
  Mic,
  Info
} from 'lucide-react';

export interface FeedbackItem {
  id: string;
  quote: string;
  context: string;
  category: string;
  highlight: string;
  iconName: string;
  tagColor: string;
}

const FEEDBACK_ITEMS: FeedbackItem[] = [
  {
    id: 'fb-1',
    quote: "Finally, I don't have to hunt for my paper receipt when something breaks.",
    context: "Purchase Tracking",
    category: "Consumer Tech",
    highlight: "100% Retrievable",
    iconName: 'shield',
    tagColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  },
  {
    id: 'fb-2',
    quote: "The 30-day return deadline was calculated automatically right after upload.",
    context: "Return Protection",
    category: "Fashion & Apparel",
    highlight: "Automated Window",
    iconName: 'calendar',
    tagColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
  {
    id: 'fb-3',
    quote: "I could see exactly which clause from the store's policy document was cited.",
    context: "Policy Transparency",
    category: "Retail Policy",
    highlight: "Clause 3.1 Grounded",
    iconName: 'file-check',
    tagColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  },
  {
    id: 'fb-4',
    quote: "The order lookup told me immediately that an unverified ID wasn't in the database.",
    context: "Verified Lookup",
    category: "Order Status",
    highlight: "Zero Hallucinations",
    iconName: 'search',
    tagColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
  {
    id: 'fb-5',
    quote: "I corrected one extracted field in the draft review modal before permanently saving.",
    context: "Review & Confirmation",
    category: "Draft Staging",
    highlight: "Human In The Loop",
    iconName: 'edit',
    tagColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  },
  {
    id: 'fb-6',
    quote: "The original PDF invoice is preserved byte-for-byte in my vault, ready to download.",
    context: "Receipt Vault",
    category: "Document Security",
    highlight: "Binary Vault",
    iconName: 'archive',
    tagColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  },
  {
    id: 'fb-7',
    quote: "Proactive alert warned me that my jacket return expired in 5 days.",
    context: "Expiry Alert",
    category: "Purchase Window",
    highlight: "Proactive Action",
    iconName: 'bell',
    tagColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
  {
    id: 'fb-8',
    quote: "Even with a wrinkled photo taken on my phone, OCR extracted every line item accurately.",
    context: "Vision OCR",
    category: "Mobile Ingestion",
    highlight: "Multi-Format OCR",
    iconName: 'scan',
    tagColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  },
  {
    id: 'fb-9',
    quote: "Deterministic date calculations matched my calendar exactly—no LLM date arithmetic errors.",
    context: "Deterministic Math",
    category: "Date Precision",
    highlight: "Code-Governed",
    iconName: 'calculator',
    tagColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
  {
    id: 'fb-10',
    quote: "Instant search by invoice number INV-1024 pulled up the item warranty in milliseconds.",
    context: "Vault Search",
    category: "Fast Retrieval",
    highlight: "Indexed Metadata",
    iconName: 'sparkles',
    tagColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  },
  {
    id: 'fb-11',
    quote: "Chroma RAG answered 'Can I return an opened box?' referencing the exact return clause.",
    context: "Policy RAG",
    category: "Contextual Q&A",
    highlight: "Shopper-Isolated",
    iconName: 'message-square',
    tagColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  },
  {
    id: 'fb-12',
    quote: "The dual view let me compare my uploaded image side-by-side with extracted item values.",
    context: "Side-by-Side Review",
    category: "Visual Audit",
    highlight: "Audit Trail",
    iconName: 'eye',
    tagColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  },
  {
    id: 'fb-13',
    quote: "One-click download of my tax invoices made expense tracking completely effortless.",
    context: "Tax Export",
    category: "Financial Records",
    highlight: "Original Format",
    iconName: 'download',
    tagColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
  {
    id: 'fb-14',
    quote: "Flagged an excluded clearance item before I drove all the way back to the store.",
    context: "Exclusion Checks",
    category: "Policy Grounding",
    highlight: "Saved Trip",
    iconName: 'alert-triangle',
    tagColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
  {
    id: 'fb-15',
    quote: "Voice input let me ask 'When does my laptop warranty end?' completely hands-free.",
    context: "Unified Composer",
    category: "Voice Assistant",
    highlight: "Speech-to-Text",
    iconName: 'mic',
    tagColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  },
];

function FeedbackIcon({ name, className }: { name: string; className?: string }) {
  const classes = className || "w-4 h-4";
  switch (name) {
    case 'shield': return <Shield className={classes} />;
    case 'calendar': return <Calendar className={classes} />;
    case 'file-check': return <FileCheck2 className={classes} />;
    case 'search': return <Search className={classes} />;
    case 'edit': return <Edit3 className={classes} />;
    case 'archive': return <Archive className={classes} />;
    case 'bell': return <Bell className={classes} />;
    case 'scan': return <Scan className={classes} />;
    case 'calculator': return <Calculator className={classes} />;
    case 'sparkles': return <Sparkles className={classes} />;
    case 'message-square': return <MessageSquare className={classes} />;
    case 'eye': return <Eye className={classes} />;
    case 'download': return <Download className={classes} />;
    case 'alert-triangle': return <AlertTriangle className={classes} />;
    case 'mic': return <Mic className={classes} />;
    default: return <Sparkles className={classes} />;
  }
}

interface FeedbackCardProps {
  item: FeedbackItem;
  isHovered: boolean;
  onHover: (id: string | null) => void;
}

const FeedbackCard: React.FC<FeedbackCardProps> = ({ item, isHovered, onHover }) => {
  return (
    <div
      onMouseEnter={() => onHover(item.id)}
      onMouseLeave={() => onHover(null)}
      className={`relative w-full rounded-2xl p-4 transition-all duration-300 select-none cursor-pointer backdrop-blur-md ${
        isHovered
          ? 'bg-slate-800/95 border-indigo-400/80 shadow-2xl shadow-indigo-500/20 scale-[1.04] z-40 translate-y-[-4px]'
          : 'bg-slate-900/85 border border-slate-800/80 shadow-lg shadow-black/40 hover:border-slate-700/80'
      }`}
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Top Bar: Icon Badge + Context & Demo Badge */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-xl bg-slate-800 border border-slate-700/70 flex items-center justify-center text-indigo-300">
            <FeedbackIcon name={item.iconName} className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200 tracking-tight leading-none">
              {item.context}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {item.category}
            </div>
          </div>
        </div>

        <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${item.tagColor}`}>
          {item.highlight}
        </span>
      </div>

      {/* Quote Statement */}
      <p className="text-xs font-medium text-slate-200 leading-relaxed tracking-normal">
        "{item.quote}"
      </p>

      {/* Footer Attribution (Explicitly demo-safe) */}
      <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
        <span>— Demo Feedback</span>
        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">Illustrative</span>
      </div>
    </div>
  );
};

export const Feedback3DWall: React.FC = () => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Distribute items into 5 staggered columns
  const col1 = [FEEDBACK_ITEMS[0], FEEDBACK_ITEMS[5], FEEDBACK_ITEMS[10], FEEDBACK_ITEMS[1], FEEDBACK_ITEMS[6]];
  const col2 = [FEEDBACK_ITEMS[2], FEEDBACK_ITEMS[7], FEEDBACK_ITEMS[12], FEEDBACK_ITEMS[3], FEEDBACK_ITEMS[8]];
  const col3 = [FEEDBACK_ITEMS[4], FEEDBACK_ITEMS[9], FEEDBACK_ITEMS[14], FEEDBACK_ITEMS[0], FEEDBACK_ITEMS[13]];
  const col4 = [FEEDBACK_ITEMS[1], FEEDBACK_ITEMS[6], FEEDBACK_ITEMS[11], FEEDBACK_ITEMS[2], FEEDBACK_ITEMS[7]];
  const col5 = [FEEDBACK_ITEMS[3], FEEDBACK_ITEMS[8], FEEDBACK_ITEMS[13], FEEDBACK_ITEMS[4], FEEDBACK_ITEMS[9]];

  const columnsConfig = [
    {
      items: [...col1, ...col1, ...col1],
      animationClass: 'animate-marquee-up',
      duration: '38s',
      colTransform: 'rotateY(-10deg) translateZ(-25px)',
      responsiveClass: 'hidden xl:flex',
    },
    {
      items: [...col2, ...col2, ...col2],
      animationClass: 'animate-marquee-down',
      duration: '46s',
      colTransform: 'rotateY(-5deg) translateZ(8px)',
      responsiveClass: 'hidden md:flex',
    },
    {
      items: [...col3, ...col3, ...col3],
      animationClass: 'animate-marquee-up',
      duration: '34s',
      colTransform: 'rotateY(0deg) translateZ(30px)',
      responsiveClass: 'flex',
    },
    {
      items: [...col4, ...col4, ...col4],
      animationClass: 'animate-marquee-down',
      duration: '42s',
      colTransform: 'rotateY(5deg) translateZ(8px)',
      responsiveClass: 'flex',
    },
    {
      items: [...col5, ...col5, ...col5],
      animationClass: 'animate-marquee-up',
      duration: '40s',
      colTransform: 'rotateY(10deg) translateZ(-25px)',
      responsiveClass: 'hidden lg:flex',
    },
  ];

  return (
    <section
      aria-label="Product Feedback Preview"
      className="w-full py-10 space-y-6 overflow-hidden relative"
    >
      {/* Section Header */}
      <div className="text-center space-y-2.5 max-w-3xl mx-auto px-4">
        <div className="inline-flex items-center space-x-2 px-3 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-[11px] font-semibold uppercase tracking-wider">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span>Product Feedback Preview</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Built For What Happens After Checkout
        </h2>

        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          See how Rupertrace helps customers keep track of the purchase details that matter—from return deadlines to warranty clauses.
        </p>
      </div>

      {/* 3D Perspective Stage Container */}
      <div className="relative w-full h-[380px] sm:h-[460px] lg:h-[560px] overflow-hidden rounded-3xl border border-slate-800/60 bg-gradient-to-b from-slate-950/40 via-navy-950/60 to-slate-950/80">
        
        {/* Top/Bottom Gradient Masking Overlay */}
        <div className="absolute inset-0 pointer-events-none z-20 mask-gradient-y" />
        
        {/* Radial Vignette Edges for soft blending */}
        <div
          className="absolute inset-0 pointer-events-none z-20"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 40%, rgba(3, 7, 18, 0.85) 100%)',
          }}
        />

        {/* 3D Perspective Canvas */}
        <div
          className="w-full h-full flex justify-center items-center preserve-3d"
          style={{
            perspective: '1200px',
          }}
        >
          <div
            className="w-full max-w-7xl px-4 flex justify-center gap-4 sm:gap-6 preserve-3d transition-transform duration-700"
            style={{
              transform: 'rotateX(14deg) rotateY(-8deg) rotateZ(6deg) scale(0.96)',
            }}
          >
            {columnsConfig.map((col, colIdx) => (
              <div
                key={`col-${colIdx}`}
                className={`flex-1 min-w-[200px] max-w-[260px] flex-col preserve-3d group ${col.responsiveClass}`}
                style={{
                  transform: col.colTransform,
                  transformStyle: 'preserve-3d',
                }}
              >
                <div
                  className={`flex flex-col space-y-4 ${col.animationClass} group-hover:[animation-play-state:paused]`}
                  style={{
                    '--duration': col.duration,
                    animationPlayState: hoveredId ? 'paused' : undefined,
                  } as React.CSSProperties}
                >
                  {col.items.map((item, itemIdx) => (
                    <FeedbackCard
                      key={`card-${colIdx}-${item.id}-${itemIdx}`}
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

      {/* Clear Demo Label & Guidance Footer */}
      <div className="flex items-center justify-center space-x-2 text-[11px] text-slate-400 px-4 text-center">
        <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
        <span>
          Illustrative feedback preview depicting purchase protection scenarios • Hover any card to pause & inspect
        </span>
      </div>
    </section>
  );
};
