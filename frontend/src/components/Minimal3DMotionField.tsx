import React, { useState } from 'react';

/* =========================================================================
   TYPES
   ========================================================================= */

interface ReviewCard {
  type: 'review';
  id: string;
  name: string;
  handle: string;
  countryCode: string;
  countryName: string;
  quote: string;
  avatarBg: string;
  avatarInitial: string;
  icon?: 'shield' | 'calendar' | 'policy' | 'search' | 'edit' | 'archive' | 'calc' | 'camera' | 'lock' | 'sparkles';
}

interface BrandCard {
  type: 'brand';
  id: string;
  name: string;
  category: string;
  tagline: string;
}

type CardItem = ReviewCard | BrandCard;

/* =========================================================================
   AUTHENTIC REVIEWS DIRECTLY INSPIRED BY THE REFERENCE RECORDING
   ========================================================================= */

const ALL_REVIEWS: ReviewCard[] = [
  {
    type: 'review',
    id: 'rev-1',
    name: 'Mateo Rossi',
    handle: 'mat',
    countryCode: 'IT',
    countryName: 'Italy',
    quote: 'Animations are buttery smooth!',
    avatarBg: 'bg-gradient-to-tr from-amber-400 to-orange-500',
    avatarInitial: 'M',
    icon: 'sparkles',
  },
  {
    type: 'review',
    id: 'rev-2',
    name: 'Maya Patel',
    handle: 'maya',
    countryCode: 'IN',
    countryName: 'India',
    quote: 'Setup was a breeze!',
    avatarBg: 'bg-gradient-to-tr from-purple-500 to-indigo-600',
    avatarInitial: 'M',
    icon: 'shield',
  },
  {
    type: 'review',
    id: 'rev-3',
    name: 'Noah Smith',
    handle: 'noah',
    countryCode: 'US',
    countryName: 'USA',
    quote: 'Best marquee component!',
    avatarBg: 'bg-gradient-to-tr from-sky-400 to-blue-600',
    avatarInitial: 'N',
    icon: 'shield',
  },
  {
    type: 'review',
    id: 'rev-4',
    name: 'Ana Miller',
    handle: 'ana',
    countryCode: 'DE',
    countryName: 'Germany',
    quote: 'Vertical marquee is a game changer!',
    avatarBg: 'bg-gradient-to-tr from-rose-400 to-pink-600',
    avatarInitial: 'A',
    icon: 'calendar',
  },
  {
    type: 'review',
    id: 'rev-5',
    name: 'Lucas Stone',
    handle: 'luc',
    countryCode: 'FR',
    countryName: 'France',
    quote: 'Very customizable and smooth.',
    avatarBg: 'bg-gradient-to-tr from-emerald-400 to-teal-600',
    avatarInitial: 'L',
    icon: 'edit',
  },
  {
    type: 'review',
    id: 'rev-6',
    name: 'Haruto Sato',
    handle: 'haru',
    countryCode: 'JP',
    countryName: 'Japan',
    quote: 'Impressive performance on mobile!',
    avatarBg: 'bg-gradient-to-tr from-violet-400 to-purple-600',
    avatarInitial: 'H',
    icon: 'calc',
  },
  {
    type: 'review',
    id: 'rev-7',
    name: 'Emma Lee',
    handle: 'emma',
    countryCode: 'CA',
    countryName: 'Canada',
    quote: 'Love the pause on hover feature!',
    avatarBg: 'bg-gradient-to-tr from-cyan-400 to-blue-500',
    avatarInitial: 'E',
    icon: 'lock',
  },
  {
    type: 'review',
    id: 'rev-8',
    name: 'Carlos Ray',
    handle: 'carlos',
    countryCode: 'ES',
    countryName: 'Spain',
    quote: 'Return window was easy to track.',
    avatarBg: 'bg-gradient-to-tr from-yellow-400 to-amber-600',
    avatarInitial: 'C',
    icon: 'calendar',
  },
  {
    type: 'review',
    id: 'rev-9',
    name: 'Sophie Dubois',
    handle: 'sophie',
    countryCode: 'CH',
    countryName: 'Switzerland',
    quote: 'Warranty details were easy to find.',
    avatarBg: 'bg-gradient-to-tr from-fuchsia-400 to-pink-600',
    avatarInitial: 'S',
    icon: 'calc',
  },
  {
    type: 'review',
    id: 'rev-10',
    name: 'Aarav Sharma',
    handle: 'aarav',
    countryCode: 'IN',
    countryName: 'India',
    quote: 'Original invoice preserved byte-for-byte.',
    avatarBg: 'bg-gradient-to-tr from-indigo-400 to-blue-600',
    avatarInitial: 'A',
    icon: 'archive',
  },
  {
    type: 'review',
    id: 'rev-11',
    name: 'Liam Wilson',
    handle: 'liam',
    countryCode: 'AU',
    countryName: 'Australia',
    quote: 'Zero hallucinations on missing orders.',
    avatarBg: 'bg-gradient-to-tr from-teal-400 to-emerald-600',
    avatarInitial: 'L',
    icon: 'shield',
  },
  {
    type: 'review',
    id: 'rev-12',
    name: 'Elena Rostova',
    handle: 'elena',
    countryCode: 'SE',
    countryName: 'Sweden',
    quote: '30-day deadline flagged proactively.',
    avatarBg: 'bg-gradient-to-tr from-rose-400 to-red-500',
    avatarInitial: 'E',
    icon: 'calendar',
  },
];

/* =========================================================================
   SUPPORTED BRAND CARDS INTEGRATED INTO THE 3D SCENE
   ========================================================================= */

const BRAND_CARDS: BrandCard[] = [
  { type: 'brand', id: 'nike', name: 'Nike', category: 'Sportswear', tagline: 'Just Do It' },
  { type: 'brand', id: 'adidas', name: 'Adidas', category: 'Sportswear', tagline: 'Impossible Is Nothing' },
  { type: 'brand', id: 'puma', name: 'Puma', category: 'Sportswear', tagline: 'Forever Faster' },
  { type: 'brand', id: 'jordan', name: 'Jordan', category: 'Footwear', tagline: 'Flight Heritage' },
  { type: 'brand', id: 'converse', name: 'Converse', category: 'Footwear', tagline: 'All Star' },
  { type: 'brand', id: 'apple', name: 'Apple', category: 'Consumer Tech', tagline: 'Think Different' },
  { type: 'brand', id: 'amazon', name: 'Amazon', category: 'Marketplace', tagline: 'Delivering Smiles' },
  { type: 'brand', id: 'zara', name: 'Zara', category: 'Fashion', tagline: 'Global Retail' },
  { type: 'brand', id: 'gucci', name: 'Gucci', category: 'Luxury', tagline: 'Firenze 1921' },
  { type: 'brand', id: 'prada', name: 'Prada', category: 'Haute Couture', tagline: 'Milano 1913' },
];

/* =========================================================================
   MONOCHROME BRAND GLYPH COMPONENT
   ========================================================================= */

function BrandGlyph({ id }: { id: string }) {
  const commonClass = 'w-5 h-5 fill-slate-700 text-slate-700 stroke-none';

  switch (id) {
    case 'nike':
      return (
        <svg className={commonClass} viewBox="0 0 24 24">
          <path d="M21.7 4.2C13.2 8.3 5.4 14.3 2.3 17.5c-1.2 1.2-.9 2.5.6 2.5 1.5 0 4.1-.7 7.7-2.1 6.5-2.5 11.1-6.7 11.1-13.7z" />
        </svg>
      );
    case 'adidas':
      return (
        <svg className={commonClass} viewBox="0 0 24 24">
          <path d="M7.4 19.5L1.5 19.5 4.5 14.2 8.9 16.8z M12.8 19.5L7.9 19.5 12.3 11.8 15.8 13.8z M18.2 19.5L14.3 19.5 20.2 9.2 22.8 10.7z" />
        </svg>
      );
    case 'puma':
      return (
        <svg className={commonClass} viewBox="0 0 24 24">
          <path d="M19.5 5.5c-1.3-.8-2.6-.9-3.8-.4-.4.2-.7.5-.9.9-.4.7-.4 1.5-.1 2.2l-2.4 1.7c-1.1-.9-2.6-1.3-4-1-1.8.4-3.3 1.8-3.8 3.5-.3 1.1-.2 2.2.3 3.2.4.8 1 1.4 1.8 1.8l-1.4 1.4c-.4.4-.4 1 0 1.4.4.4 1 .4 1.4 0l2.3-2.3c1.2.3 2.5.1 3.6-.5 1.4-.8 2.3-2.1 2.5-3.6l2.3-1.6c.7.2 1.5.1 2.2-.3.7-.4 1.1-1.1 1.1-1.9.1-1.8-1.2-3.7-3.2-4.5z" />
        </svg>
      );
    case 'jordan':
      return (
        <svg className={commonClass} viewBox="0 0 24 24">
          <path d="M14.5 3c-.8 0-1.5.7-1.5 1.5s.7 1.5 1.5 1.5 1.5-.7 1.5-1.5-.7-1.5-1.5-1.5zm2.8 4.2l-3.2 3.1-2.1-1.8-4.5 3.2 1.2 1.5 3.5-2.5 2.1 1.8 4.6-4.5 1.2 1.4.9-.8-3.7-1.4z M11 13.5l-3.2 7.5h2.2l2.3-5.5 2.1 5.5h2.2L13.4 13.5z" />
        </svg>
      );
    case 'converse':
      return (
        <svg className={commonClass} viewBox="0 0 24 24">
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 4.2l1.6 3.4 3.7.5-2.7 2.6.6 3.7-3.2-1.7-3.2 1.7.6-3.7-2.7-2.6 3.7-.5z" />
        </svg>
      );
    case 'apple':
      return (
        <svg className={commonClass} viewBox="0 0 24 24">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.41c.62-.75 1.04-1.8 0.92-2.85-.9.04-2 0.6-2.65 1.36-.57.66-.99 1.72-.85 2.74 1.01.08 1.96-.5 2.58-1.25z" />
        </svg>
      );
    case 'amazon':
      return (
        <svg className={commonClass} viewBox="0 0 24 24">
          <path d="M13.9 12.2c-.1.8-.7 1.2-1.5 1.2-1.1 0-1.7-.8-1.7-2.1 0-1.5.8-2.3 2-2.3.6 0 1 .2 1.2.6v2.6zm3.3 2.9c-.1-.3-.2-.8-.2-1.3-.6.9-1.5 1.5-2.6 1.5-1.9 0-3.3-1.4-3.3-3.7 0-2.4 1.5-3.8 3.5-3.8.9 0 1.7.4 2.2.9V6.2h2.2v8.9h-1.8zm-14.7 4c5.8 4 14.5 3.3 19.3-.9.3-.3.1-.7-.3-.6-4.4 2-13.8 2.5-18.7-1.1-.3-.2-.5.3-.3.6zm20-1.1c-.5-.7-2.1-.3-3.1-.1-.3.1-.3.4 0 .5 2.1.8 2.8 1.4 3 1.6.2.2.4 0 .3-.3-.1-.4-.1-1.1-.2-1.7z" />
        </svg>
      );
    case 'zara':
      return <div className="font-serif font-black text-xs tracking-tighter text-slate-900 scale-y-110">ZARA</div>;
    case 'gucci':
      return (
        <svg className={commonClass} viewBox="0 0 24 24">
          <path d="M8.5 7C5.5 7 3 9.2 3 12s2.5 5 5.5 5c2.3 0 4.2-1.3 5-3.2h-2.3c-.6 1-1.6 1.6-2.7 1.6-1.9 0-3.4-1.5-3.4-3.4s1.5-3.4 3.4-3.4c1.1 0 2.1.6 2.7 1.6h2.3C12.7 8.3 10.8 7 8.5 7zm7 0c-2.3 0-4.2 1.3-5 3.2h2.3c.6-1 1.6-1.6 2.7-1.6 1.9 0 3.4 1.5 3.4 3.4s-1.5 3.4-3.4 3.4c-1.1 0-2.1-.6-2.7-1.6h-2.3c.8 1.9 2.7 3.2 5 3.2 3 0 5.5-2.2 5.5-5s-2.5-5-5.5-5z" />
        </svg>
      );
    case 'prada':
      return <div className="font-serif font-black text-[11px] tracking-[0.2em] text-slate-800">PRADA</div>;
    default:
      return <div className="font-sans font-bold text-xs text-slate-700 uppercase">{id.slice(0, 3)}</div>;
  }
}

/* =========================================================================
   MAIN COMPONENT: 3D PERSPECTIVE TILTED INFINITE MARQUEE WALL
   ========================================================================= */

export const Minimal3DMotionField: React.FC = () => {
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  // Distribute items into dense columns spanning seamlessly from the leftmost edge
  const col1: CardItem[] = [ALL_REVIEWS[0], BRAND_CARDS[0], ALL_REVIEWS[3], ALL_REVIEWS[6], BRAND_CARDS[3]];
  const col2: CardItem[] = [ALL_REVIEWS[1], BRAND_CARDS[1], ALL_REVIEWS[4], ALL_REVIEWS[7], BRAND_CARDS[4]];
  const col3: CardItem[] = [ALL_REVIEWS[2], BRAND_CARDS[2], ALL_REVIEWS[5], ALL_REVIEWS[8], BRAND_CARDS[5]];
  const col4: CardItem[] = [ALL_REVIEWS[9], BRAND_CARDS[6], ALL_REVIEWS[10], ALL_REVIEWS[0], BRAND_CARDS[7]];
  const col5: CardItem[] = [ALL_REVIEWS[11], BRAND_CARDS[8], ALL_REVIEWS[1], ALL_REVIEWS[4], BRAND_CARDS[9]];
  const col6: CardItem[] = [ALL_REVIEWS[3], BRAND_CARDS[5], ALL_REVIEWS[6], ALL_REVIEWS[8], BRAND_CARDS[1]];
  const col7: CardItem[] = [ALL_REVIEWS[7], BRAND_CARDS[2], ALL_REVIEWS[10], ALL_REVIEWS[2], BRAND_CARDS[0]];
  const col8: CardItem[] = [ALL_REVIEWS[5], BRAND_CARDS[7], ALL_REVIEWS[9], ALL_REVIEWS[11], BRAND_CARDS[4]];
  const col9: CardItem[] = [ALL_REVIEWS[8], BRAND_CARDS[9], ALL_REVIEWS[0], ALL_REVIEWS[4], BRAND_CARDS[6]];

  const columns = [
    {
      items: [...col1, ...col1],
      animationClass: 'animate-marquee-up',
      duration: '38s',
      responsiveClass: 'flex',
    },
    {
      items: [...col2, ...col2],
      animationClass: 'animate-marquee-down',
      duration: '44s',
      responsiveClass: 'flex',
    },
    {
      items: [...col3, ...col3],
      animationClass: 'animate-marquee-up',
      duration: '36s',
      responsiveClass: 'flex',
    },
    {
      items: [...col4, ...col4],
      animationClass: 'animate-marquee-down',
      duration: '42s',
      responsiveClass: 'flex',
    },
    {
      items: [...col5, ...col5],
      animationClass: 'animate-marquee-up',
      duration: '39s',
      responsiveClass: 'flex',
    },
    {
      items: [...col6, ...col6],
      animationClass: 'animate-marquee-down',
      duration: '46s',
      responsiveClass: 'flex',
    },
    {
      items: [...col7, ...col7],
      animationClass: 'animate-marquee-up',
      duration: '40s',
      responsiveClass: 'hidden sm:flex',
    },
    {
      items: [...col8, ...col8],
      animationClass: 'animate-marquee-down',
      duration: '45s',
      responsiveClass: 'hidden md:flex',
    },
    {
      items: [...col9, ...col9],
      animationClass: 'animate-marquee-up',
      duration: '37s',
      responsiveClass: 'hidden lg:flex',
    },
  ];

  return (
    <div
      aria-hidden="true"
      className="background-motion select-none pointer-events-none"
    >
      {/* 
        =======================================================================
        3D PERSPECTIVE VIEWPORT (Starts from leftmost end and spans across)
        perspective: 1200px
        rotateX(22deg) rotateY(-12deg) rotateZ(18deg)
        =======================================================================
      */}
      <div
        className="w-full h-full flex justify-start items-center preserve-3d"
        style={{
          perspective: '1200px',
        }}
      >
        <div
          className="w-max flex justify-start gap-4 sm:gap-5 preserve-3d transition-transform duration-700 ease-out"
          style={{
            transform: 'rotateX(22deg) rotateY(-12deg) rotateZ(18deg) scale(1.12)',
            transformOrigin: 'left center',
            transformStyle: 'preserve-3d',
          }}
        >
          {columns.map((col, colIdx) => (
            <div
              key={`motion-col-${colIdx}`}
              className={`flex-shrink-0 w-[215px] sm:w-[245px] flex-col preserve-3d ${col.responsiveClass} pointer-events-auto`}
              style={{
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Vertical Marquee Infinite Track */}
              <div
                className={`flex flex-col space-y-4 sm:space-y-4.5 ${col.animationClass}`}
                style={{
                  '--duration': col.duration,
                  animationPlayState: hoveredCardId ? 'paused' : undefined,
                } as React.CSSProperties}
              >
                {col.items.map((item, itemIdx) => {
                  const key = `col-${colIdx}-item-${item.id}-${itemIdx}`;
                  const isHovered = hoveredCardId === `${colIdx}-${item.id}-${itemIdx}`;

                  if (item.type === 'review') {
                    return (
                      <div
                        key={key}
                        onMouseEnter={() => setHoveredCardId(`${colIdx}-${item.id}-${itemIdx}`)}
                        onMouseLeave={() => setHoveredCardId(null)}
                        className="w-[215px] sm:w-[245px] rounded-[22px] p-4 transition-all duration-300 cursor-default border flex flex-col justify-between"
                        style={{
                          background: 'rgba(255, 255, 255, 0.96)',
                          border: isHovered
                            ? '1px solid rgba(99, 102, 241, 0.45)'
                            : '1px solid rgba(15, 23, 42, 0.08)',
                          boxShadow: isHovered
                            ? '0 18px 40px -4px rgba(15, 23, 42, 0.14)'
                            : '0 10px 30px -4px rgba(15, 23, 42, 0.06), 0 4px 8px -2px rgba(15, 23, 42, 0.03)',
                          transform: isHovered
                            ? 'scale(1.05) translateZ(30px)'
                            : 'scale(1.0)',
                          transformStyle: 'preserve-3d',
                          backdropFilter: 'blur(8px)',
                          WebkitBackdropFilter: 'blur(8px)',
                        }}
                      >
                        {/* Header matching exact reference recording */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2.5">
                            {/* Colorful circular avatar badge */}
                            <div className={`w-8 h-8 rounded-full ${item.avatarBg} text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-xs ring-2 ring-white`}>
                              {item.avatarInitial}
                            </div>
                            <div className="flex flex-col text-left">
                              <span className="text-xs font-bold text-slate-800 tracking-tight leading-tight">
                                {item.name}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium">
                                @{item.handle}
                              </span>
                            </div>
                          </div>

                          {/* Country Code + Name */}
                          <div className="flex flex-col items-end text-right">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider leading-tight">
                              {item.countryCode}
                            </span>
                            <span className="text-[9px] text-slate-400 font-medium">
                              {item.countryName}
                            </span>
                          </div>
                        </div>

                        {/* Card Quote Body */}
                        <p className="text-[12px] font-semibold text-slate-700 leading-snug text-left mt-0.5">
                          {item.quote}
                        </p>
                      </div>
                    );
                  }

                  // Brand Card
                  return (
                    <div
                      key={key}
                      onMouseEnter={() => setHoveredCardId(`${colIdx}-${item.id}-${itemIdx}`)}
                      onMouseLeave={() => setHoveredCardId(null)}
                      className="w-[215px] sm:w-[245px] rounded-[22px] px-4 py-3.5 transition-all duration-300 cursor-default border flex items-center justify-between"
                      style={{
                        background: 'rgba(255, 255, 255, 0.94)',
                        border: isHovered
                          ? '1px solid rgba(99, 102, 241, 0.45)'
                          : '1px solid rgba(15, 23, 42, 0.08)',
                        boxShadow: isHovered
                          ? '0 18px 40px -4px rgba(15, 23, 42, 0.14)'
                          : '0 8px 25px -4px rgba(15, 23, 42, 0.05), 0 3px 6px -2px rgba(15, 23, 42, 0.02)',
                        transform: isHovered
                          ? 'scale(1.05) translateZ(30px)'
                          : 'scale(1.0)',
                        transformStyle: 'preserve-3d',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-100/90 border border-slate-200/80 flex items-center justify-center flex-shrink-0 text-slate-700 shadow-2xs">
                          <BrandGlyph id={item.id} />
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="text-xs font-bold text-slate-800 tracking-tight leading-tight">
                            {item.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {item.tagline}
                          </span>
                        </div>
                      </div>

                      <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold bg-slate-100/90 px-2 py-0.5 rounded-full border border-slate-200/60">
                        {item.category}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
