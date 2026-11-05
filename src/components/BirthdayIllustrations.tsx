import React, { useState } from 'react';
import { Heart, Sparkles, Star, Gift } from 'lucide-react';

/**
 * Festive multi-flag ribbon / bunting banner in Sunshine Yellow, Orange, Cream, and Coral.
 */
export function FestiveBuntingBanner() {
  const colors = ['#F15B48', '#FFC928', '#FF8A32', '#FFF3D1', '#F15B48', '#FFC928', '#FF8A32', '#F15B48', '#FFC928', '#FF8A32'];
  return (
    <div className="w-full overflow-hidden select-none pointer-events-none py-1">
      <svg
        viewBox="0 0 800 68"
        className="w-full max-w-4xl mx-auto h-12 sm:h-16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Curved ribbon cord */}
        <path
          d="M 0 8 Q 200 28 400 10 Q 600 28 800 8"
          stroke="#2B1E1A"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {colors.map((fill, idx) => {
          const x = idx * 80 + 12;
          const yOffset = idx % 2 === 0 ? 11 : 15;
          return (
            <g key={idx}>
              <polygon
                points={`${x},${yOffset} ${x + 56},${yOffset} ${x + 28},${yOffset + 46}`}
                fill={fill}
                stroke="#2B1E1A"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              <circle cx={x + 28} cy={yOffset + 18} r="4" fill="#FFFFFF" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/**
 * Hand-crafted SVG Illustrated Birthday Cake (used as the Homepage centerpiece — never her photo).
 */
export function IllustratedBirthdayCake({ className = 'w-64 h-64 sm:w-76 sm:h-76' }: { className?: string }) {
  return (
    <div className={`relative select-none mx-auto ${className}`}>
      <svg
        viewBox="0 0 320 320"
        className="w-full h-full drop-shadow-xs"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background circular sunburst halo */}
        <circle
          cx="160"
          cy="172"
          r="128"
          fill="#FFF3D1"
          stroke="#2B1E1A"
          strokeWidth="4"
        />
        <circle
          cx="160"
          cy="172"
          r="108"
          fill="#FF8A32"
          fillOpacity="0.22"
          stroke="#FF8A32"
          strokeWidth="2"
          strokeDasharray="8 8"
        />

        {/* Decorative floating stars & hearts inside illustration */}
        <path
          d="M58 95 L63 107 L76 109 L66 118 L68 131 L58 124 L48 131 L50 118 L40 109 L53 107 Z"
          fill="#FFC928"
          stroke="#2B1E1A"
          strokeWidth="2.5"
        />
        <path
          d="M262 88 L266 98 L277 100 L269 107 L271 118 L262 112 L253 118 L255 107 L247 100 L258 98 Z"
          fill="#F15B48"
          stroke="#2B1E1A"
          strokeWidth="2.5"
        />

        {/* Cake Stand / Plate */}
        <ellipse
          cx="160"
          cy="268"
          rx="112"
          ry="16"
          fill="#FFFFFF"
          stroke="#2B1E1A"
          strokeWidth="4"
        />
        <rect
          x="136"
          y="268"
          width="48"
          height="18"
          rx="6"
          fill="#FFC928"
          stroke="#2B1E1A"
          strokeWidth="4"
        />
        <ellipse
          cx="160"
          cy="288"
          rx="64"
          ry="10"
          fill="#F15B48"
          stroke="#2B1E1A"
          strokeWidth="4"
        />

        {/* Bottom Cake Tier (Coral #F15B48) */}
        <rect
          x="68"
          y="192"
          width="184"
          height="74"
          rx="18"
          fill="#F15B48"
          stroke="#2B1E1A"
          strokeWidth="4"
        />
        {/* Bottom Tier Cream Icing Drips */}
        <path
          d="M68 206 C68 196, 82 192, 92 192 L228 192 C238 192, 252 196, 252 206 L252 216 C242 226, 232 210, 222 222 C212 234, 198 212, 188 224 C178 236, 164 212, 154 226 C144 238, 130 212, 120 224 C110 234, 96 212, 86 222 C76 230, 68 220, 68 214 Z"
          fill="#FFF3D1"
          stroke="#2B1E1A"
          strokeWidth="3.5"
        />
        {/* Bottom Tier Decorative Polka Dots / Sprinkles */}
        <circle cx="96" cy="244" r="5" fill="#FFC928" stroke="#2B1E1A" strokeWidth="2" />
        <circle cx="138" cy="248" r="5" fill="#FFF3D1" stroke="#2B1E1A" strokeWidth="2" />
        <circle cx="182" cy="244" r="5" fill="#FFC928" stroke="#2B1E1A" strokeWidth="2" />
        <circle cx="224" cy="248" r="5" fill="#FFF3D1" stroke="#2B1E1A" strokeWidth="2" />

        {/* Top Cake Tier (Orange #FF8A32) */}
        <rect
          x="96"
          y="128"
          width="128"
          height="66"
          rx="14"
          fill="#FF8A32"
          stroke="#2B1E1A"
          strokeWidth="4"
        />
        {/* Top Tier Cream & Sunshine Frosting Drips */}
        <path
          d="M96 140 C96 132, 106 128, 114 128 L206 128 C214 128, 224 132, 224 140 L224 148 C214 158, 204 142, 194 154 C184 166, 170 144, 160 156 C150 168, 136 144, 126 154 C116 164, 104 146, 96 152 Z"
          fill="#FFFFFF"
          stroke="#2B1E1A"
          strokeWidth="3.5"
        />

        {/* Strawberries / Cherries on Top Tier */}
        <circle cx="116" cy="124" r="9" fill="#F15B48" stroke="#2B1E1A" strokeWidth="3" />
        <circle cx="160" cy="124" r="9" fill="#F15B48" stroke="#2B1E1A" strokeWidth="3" />
        <circle cx="204" cy="124" r="9" fill="#F15B48" stroke="#2B1E1A" strokeWidth="3" />

        {/* 3 Birthday Candles */}
        {/* Left Candle */}
        <rect
          x="130"
          y="82"
          width="12"
          height="46"
          rx="4"
          fill="#FFF3D1"
          stroke="#2B1E1A"
          strokeWidth="3"
        />
        <line x1="130" y1="96" x2="142" y2="92" stroke="#F15B48" strokeWidth="3" />
        <line x1="130" y1="112" x2="142" y2="108" stroke="#F15B48" strokeWidth="3" />
        <path
          className="animate-candle"
          d="M136 56 C144 66, 144 76, 136 80 C128 76, 128 66, 136 56 Z"
          fill="#FFC928"
          stroke="#2B1E1A"
          strokeWidth="2.5"
        />

        {/* Center Candle */}
        <rect
          x="154"
          y="74"
          width="12"
          height="54"
          rx="4"
          fill="#FFFFFF"
          stroke="#2B1E1A"
          strokeWidth="3"
        />
        <line x1="154" y1="90" x2="166" y2="86" stroke="#FF8A32" strokeWidth="3" />
        <line x1="154" y1="106" x2="166" y2="102" stroke="#FF8A32" strokeWidth="3" />
        <path
          className="animate-candle"
          d="M160 46 C169 57, 169 68, 160 72 C151 68, 151 57, 160 46 Z"
          fill="#FFC928"
          stroke="#2B1E1A"
          strokeWidth="2.5"
        />

        {/* Right Candle */}
        <rect
          x="178"
          y="82"
          width="12"
          height="46"
          rx="4"
          fill="#FFF3D1"
          stroke="#2B1E1A"
          strokeWidth="3"
        />
        <line x1="178" y1="96" x2="190" y2="92" stroke="#F15B48" strokeWidth="3" />
        <line x1="178" y1="112" x2="190" y2="108" stroke="#F15B48" strokeWidth="3" />
        <path
          className="animate-candle"
          d="M184 56 C192 66, 192 76, 184 80 C176 76, 176 66, 184 56 Z"
          fill="#FFC928"
          stroke="#2B1E1A"
          strokeWidth="2.5"
        />

        {/* Banner Ribbon Across Bottom Tier */}
        <rect
          x="96"
          y="228"
          width="128"
          height="26"
          rx="13"
          fill="#FFC928"
          stroke="#2B1E1A"
          strokeWidth="3"
        />
        <text
          x="160"
          y="245"
          textAnchor="middle"
          fill="#2B1E1A"
          fontSize="12"
          fontWeight="800"
          fontFamily="'Fredoka', sans-serif"
        >
          LIL DEBBIE ★
        </text>
      </svg>
    </div>
  );
}

/**
 * Illustrated Balloons Cluster for sides of Hero & Password Gate
 */
export function IllustratedBalloons({ side = 'left' }: { side?: 'left' | 'right' }) {
  return (
    <div
      className={`pointer-events-none select-none ${
        side === 'left' ? 'animate-float-slow' : 'animate-float-reverse'
      }`}
    >
      <svg
        viewBox="0 0 140 210"
        className="w-24 h-36 sm:w-32 sm:h-48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Ribbon Strings */}
        <path
          d="M46 112 Q 55 150 42 195"
          stroke="#2B1E1A"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M92 124 Q 82 160 95 198"
          stroke="#2B1E1A"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Balloon 1 (Coral) */}
        <ellipse
          cx="46"
          cy="62"
          rx="36"
          ry="44"
          fill={side === 'left' ? '#F15B48' : '#FF8A32'}
          stroke="#2B1E1A"
          strokeWidth="3.5"
        />
        <path
          d="M32 38 Q 26 52 30 68"
          stroke="#FFFFFF"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <polygon points="46,106 40,114 52,114" fill="#2B1E1A" />

        {/* Balloon 2 (Sunshine / Cream) */}
        <ellipse
          cx="92"
          cy="78"
          rx="34"
          ry="42"
          fill={side === 'left' ? '#FFC928' : '#F15B48'}
          stroke="#2B1E1A"
          strokeWidth="3.5"
        />
        <path
          d="M78 56 Q 73 68 77 82"
          stroke="#FFFFFF"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <polygon points="92,120 86,128 98,128" fill="#2B1E1A" />
      </svg>
    </div>
  );
}

/**
 * Interactive Playful Hidden Message Sticker — tapping reveals a sweet hidden birthday note!
 */
export function HiddenSurpriseSticker({
  badgeLabel,
  secretMessage,
  variant = 'coral',
}: {
  badgeLabel: string;
  secretMessage: string;
  variant?: 'coral' | 'sunshine' | 'orange';
}) {
  const [revealed, setRevealed] = useState(false);

  const bgMap = {
    coral: 'bg-[#F15B48] text-white',
    sunshine: 'bg-[#FFC928] text-[#2B1E1A]',
    orange: 'bg-[#FF8A32] text-white',
  };

  return (
    <div className="my-4 flex flex-col items-center">
      <button
        type="button"
        onClick={() => setRevealed((r) => !r)}
        className={`storybook-btn inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold cursor-pointer ${bgMap[variant]}`}
      >
        <Sparkles className="w-4 h-4 shrink-0" />
        <span>{revealed ? 'Hide Little Secret ✨' : badgeLabel}</span>
      </button>

      {revealed && (
        <div className="mt-3 max-w-md bg-white border-2 border-[#2B1E1A] rounded-2xl p-4 shadow-[4px_4px_0px_#2B1E1A] text-center animate-fadeIn">
          <div className="flex items-center justify-center gap-1 text-[#F15B48] mb-1">
            <Heart className="w-4 h-4 fill-current" />
            <Star className="w-4 h-4 fill-[#FFC928] text-[#2B1E1A]" />
            <Heart className="w-4 h-4 fill-current" />
          </div>
          <p className="text-sm font-medium text-[#2B1E1A] leading-relaxed">
            {secretMessage}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Floating ambient decorative hearts & stars background overlay
 */
export function FloatingBirthdayDecor() {
  return (
    <div className="pointer-events-none select-none overflow-hidden absolute inset-0 z-0">
      <div className="absolute top-14 left-[6%] animate-float-slow text-[#F15B48]">
        <Heart className="w-6 h-6 fill-[#F15B48] stroke-[#2B1E1A] stroke-[2.2]" />
      </div>
      <div className="absolute top-28 right-[8%] animate-float-reverse text-[#FFC928]">
        <Star className="w-7 h-7 fill-[#FFC928] stroke-[#2B1E1A] stroke-[2.2]" />
      </div>
      <div className="absolute bottom-24 left-[10%] animate-float-reverse text-[#FF8A32]">
        <Sparkles className="w-6 h-6 stroke-[#2B1E1A] fill-[#FF8A32]" />
      </div>
      <div className="absolute bottom-16 right-[12%] animate-float-slow text-[#F15B48]">
        <Gift className="w-6 h-6 stroke-[#2B1E1A] text-[#F15B48]" />
      </div>
    </div>
  );
}
