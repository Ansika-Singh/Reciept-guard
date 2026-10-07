import React from 'react';
import { ShoppingBag, Sparkles } from 'lucide-react';

export interface Brand {
  id: string;
  name: string;
  category: string;
  tagline?: string;
  iconBg?: string;
  accentColor?: string;
}

const BRANDS_ROW_1: Brand[] = [
  { id: 'amazon', name: 'Amazon', category: 'Online Marketplace', accentColor: '#ff9900' },
  { id: 'flipkart', name: 'Flipkart', category: 'E-Commerce', accentColor: '#2874f0' },
  { id: 'apple', name: 'Apple Store', category: 'Consumer Tech', accentColor: '#a2aaad' },
  { id: 'myntra', name: 'Myntra', category: 'Fashion & Apparel', accentColor: '#ff3f6c' },
  { id: 'nike', name: 'Nike', category: 'Sportswear', accentColor: '#ffffff' },
  { id: 'walmart', name: 'Walmart', category: 'Retail & Grocery', accentColor: '#0071dc' },
  { id: 'bestbuy', name: 'Best Buy', category: 'Electronics', accentColor: '#fff200' },
  { id: 'ikea', name: 'IKEA', category: 'Home & Furniture', accentColor: '#0051ba' },
];

const BRANDS_ROW_2: Brand[] = [
  { id: 'zara', name: 'Zara', category: 'Fashion & Retail', accentColor: '#ffffff' },
  { id: 'ajio', name: 'Ajio', category: 'Fashion Tech', accentColor: '#d6a05e' },
  { id: 'adidas', name: 'Adidas', category: 'Sportswear', accentColor: '#ffffff' },
  { id: 'target', name: 'Target', category: 'Department Store', accentColor: '#cc0000' },
  { id: 'ebay', name: 'eBay', category: 'Marketplace', accentColor: '#e53238' },
  { id: 'meesho', name: 'Meesho', category: 'Social Commerce', accentColor: '#f43397' },
  { id: 'decathlon', name: 'Decathlon', category: 'Sports & Outdoors', accentColor: '#0082c3' },
  { id: 'costco', name: 'Costco', category: 'Wholesale Club', accentColor: '#e31837' },
];

function BrandLogoGlyph({ brand }: { brand: Brand }) {
  switch (brand.id) {
    case 'amazon':
      return (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M13.9 12.2c-.1.8-.7 1.2-1.5 1.2-1.1 0-1.7-.8-1.7-2.1 0-1.5.8-2.3 2-2.3.6 0 1 .2 1.2.6v2.6zm3.3 2.9c-.1-.3-.2-.8-.2-1.3-.6.9-1.5 1.5-2.6 1.5-1.9 0-3.3-1.4-3.3-3.7 0-2.4 1.5-3.8 3.5-3.8.9 0 1.7.4 2.2.9V6.2h2.2v8.9h-1.8zm-14.7 4c5.8 4 14.5 3.3 19.3-.9.3-.3.1-.7-.3-.6-4.4 2-13.8 2.5-18.7-1.1-.3-.2-.5.3-.3.6zm20-1.1c-.5-.7-2.1-.3-3.1-.1-.3.1-.3.4 0 .5 2.1.8 2.8 1.4 3 1.6.2.2.4 0 .3-.3-.1-.4-.1-1.1-.2-1.7z" />
        </svg>
      );
    case 'apple':
      return (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.41c.62-.75 1.04-1.8 0.92-2.85-.9.04-2 0.6-2.65 1.36-.57.66-.99 1.72-.85 2.74 1.01.08 1.96-.5 2.58-1.25z" />
        </svg>
      );
    case 'nike':
      return (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M21.7 4.2C13.2 8.3 5.4 14.3 2.3 17.5c-1.2 1.2-.9 2.5.6 2.5 1.5 0 4.1-.7 7.7-2.1 6.5-2.5 11.1-6.7 11.1-13.7z" />
        </svg>
      );
    case 'adidas':
      return (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M22.5 19.3h-4.3l-5-8.7 3.7-2.1 5.6 10.8zm-7.6 0H10.6l-3.3-5.7 3.7-2.1 4 7.8zm-7.5 0H3.1l-1.6-2.7 3.7-2.1 2.2 4.8z" />
        </svg>
      );
    case 'target':
      return (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 16c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm0-9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
        </svg>
      );
    default:
      return <ShoppingBag className="w-4 h-4" />;
  }
}

interface BrandPillProps {
  brand: Brand;
}

const BrandPill: React.FC<BrandPillProps> = ({ brand }) => {
  return (
    <div
      className="group flex-shrink-0 flex items-center space-x-3 px-5 py-3 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-500/40 hover:bg-slate-50 transition-all duration-300 shadow-2xs cursor-default select-none"
      title={`${brand.name} — ${brand.category}`}
    >
      <div
        className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 group-hover:text-indigo-600 transition-colors duration-200"
      >
        <BrandLogoGlyph brand={brand} />
      </div>

      <div className="flex flex-col text-left">
        <span className="text-xs font-bold tracking-tight text-slate-800 group-hover:text-indigo-700 transition-colors">
          {brand.name}
        </span>
        <span className="text-[10px] text-slate-500 group-hover:text-indigo-600 transition-colors">
          {brand.category}
        </span>
      </div>
    </div>
  );
};

export const BrandMarquee: React.FC = () => {
  // Seamless loop by quadrupling the items
  const row1Repeated = [...BRANDS_ROW_1, ...BRANDS_ROW_1, ...BRANDS_ROW_1, ...BRANDS_ROW_1];
  const row2Repeated = [...BRANDS_ROW_2, ...BRANDS_ROW_2, ...BRANDS_ROW_2, ...BRANDS_ROW_2];

  return (
    <section
      aria-label="Supported Stores and Brands"
      className="w-full py-8 space-y-6 overflow-hidden relative"
    >
      {/* Section Header */}
      <div className="text-center space-y-2 max-w-3xl mx-auto px-4">
        <div className="inline-flex items-center space-x-2 px-3 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-semibold uppercase tracking-wider">
          <Sparkles className="w-3 h-3 text-indigo-600" />
          <span>Works With The Way You Shop</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Universal Purchase Protection Across Stores
        </h2>

        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
          Designed around receipts, invoices, and order confirmations from the merchants you already buy from.
        </p>
      </div>

      {/* Marquee Rows Container with Edge Fades */}
      <div className="relative w-full mask-gradient-x space-y-3.5 pt-2">
        {/* Row 1: Left to Right Marquee */}
        <div
          className="flex space-x-4 animate-marquee-left hover:[animation-play-state:paused] cursor-pointer"
          style={{ '--duration': '42s' } as React.CSSProperties}
        >
          {row1Repeated.map((brand, idx) => (
            <BrandPill key={`row1-${brand.id}-${idx}`} brand={brand} />
          ))}
        </div>

        {/* Row 2: Right to Left Marquee */}
        <div
          className="flex space-x-4 animate-marquee-right hover:[animation-play-state:paused] cursor-pointer"
          style={{ '--duration': '48s' } as React.CSSProperties}
        >
          {row2Repeated.map((brand, idx) => (
            <BrandPill key={`row2-${brand.id}-${idx}`} brand={brand} />
          ))}
        </div>
      </div>

      {/* Compliance / Disclaimer Note */}
      <div className="text-center pt-1">
        <span className="text-[11px] text-slate-400">
          Independent document intelligence agent • Works with standard digital invoices, scans, and order slips
        </span>
      </div>
    </section>
  );
};
