import { getSurahTheme, PALETTES } from '@/lib/surahThemes';

/* ── helpers ─────────────────────────────────────────── */

function star(cx: number, cy: number, R: number, r: number, n: number): string {
  return Array.from({ length: n * 2 }, (_, i) => {
    const a = (i * Math.PI / n) - Math.PI / 2;
    const rad = i % 2 === 0 ? R : r;
    return `${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`;
  }).join(' ');
}

function wavePath(y: number, amp: number, freq: number, phase = 0): string {
  const pts = Array.from({ length: 57 }, (_, i) => {
    const x = i * 5;
    const yy = y + amp * Math.sin((x / freq) * 2 * Math.PI + phase);
    return `${x},${yy.toFixed(2)}`;
  });
  return `M ${pts.join(' L ')}`;
}

/* ── 8 pattern renderers ─────────────────────────────── */

type P = { fg: string };

// 0 Islamic 8-pointed star
function PatternStar({ fg }: P) {
  return (
    <g opacity="0.35">
      <polygon points={star(140, 72, 52, 22, 8)} fill={fg} />
      <polygon points={star(140, 72, 60, 56, 8)} fill="none" stroke={fg} strokeWidth="1" />
      {[[-1,-1],[1,-1],[1,1],[-1,1]].map(([sx, sy], i) => (
        <polygon key={i} points={star(140+sx*78, 72+sy*50, 14, 6, 8)} fill={fg} opacity="0.5" />
      ))}
      <circle cx="140" cy="72" r="16" fill="none" stroke={fg} strokeWidth="1" opacity="0.6" />
    </g>
  );
}

// 1 Radial rays
function PatternRadial({ fg }: P) {
  const cx = 80, cy = 72;
  const rays = 18;
  return (
    <g opacity="0.3">
      {Array.from({ length: rays }, (_, i) => {
        const a = (i * 360 / rays) * (Math.PI / 180);
        const r1 = i % 2 === 0 ? 20 : 16;
        const r2 = i % 2 === 0 ? 200 : 160;
        return (
          <line
            key={i}
            x1={(cx + r1 * Math.cos(a)).toFixed(1)} y1={(cy + r1 * Math.sin(a)).toFixed(1)}
            x2={(cx + r2 * Math.cos(a)).toFixed(1)} y2={(cy + r2 * Math.sin(a)).toFixed(1)}
            stroke={fg} strokeWidth={i % 2 === 0 ? 1.5 : 0.8}
          />
        );
      })}
      <circle cx={cx} cy={cy} r="14" fill={fg} opacity="0.8" />
      <circle cx={cx} cy={cy} r="7" fill={fg} />
    </g>
  );
}

// 2 Waves
function PatternWaves({ fg }: P) {
  return (
    <g opacity="0.35" fill="none" stroke={fg}>
      <path d={wavePath(40, 12, 80, 0)}    strokeWidth="2" />
      <path d={wavePath(72, 14, 70, 0.5)}  strokeWidth="2.5" />
      <path d={wavePath(104, 10, 90, 1)}   strokeWidth="1.5" />
      <path d={wavePath(125, 7,  60, 0.2)} strokeWidth="1" opacity="0.6" />
      <path d={wavePath(20, 6,  100, 0.8)} strokeWidth="1" opacity="0.5" />
    </g>
  );
}

// 3 Mountains
function PatternMountains({ fg }: P) {
  return (
    <g opacity="0.3" fill={fg}>
      {/* back layer */}
      <polygon points="0,144 60,30 120,90 180,20 240,80 280,40 280,144" opacity="0.3" />
      {/* mid layer */}
      <polygon points="0,144 40,65 100,110 160,42 220,95 280,55 280,144" opacity="0.5" />
      {/* front layer */}
      <polygon points="0,144 30,95 90,130 150,70 210,118 270,78 280,85 280,144" opacity="0.8" />
      {/* snow caps */}
      {[[60,30],[180,20],[40,65],[160,42]].map(([x,y],i) => (
        <polygon key={i} points={`${x},${y} ${x-12},${y+22} ${x+12},${y+22}`} fill="white" opacity="0.5" />
      ))}
    </g>
  );
}

// 4 Crescent & star
function PatternCrescent({ fg }: P) {
  // Crescent: outer circle center (146,72) r=44, inner circle center (162,72) r=34
  // Intersection points: (178, 42) and (178, 102)
  const crescent = 'M 178,42 A 44,44 0 1 0 178,102 A 34,34 0 0 1 178,42 Z';
  return (
    <g opacity="0.35">
      <path d={crescent} fill={fg} />
      {/* 5-pointed star */}
      <polygon points={star(205, 38, 13, 5, 5)} fill={fg} />
      {/* small decorative stars */}
      <polygon points={star(60, 35, 6, 2.5, 5)} fill={fg} opacity="0.6" />
      <polygon points={star(240, 100, 5, 2, 5)} fill={fg} opacity="0.5" />
      <polygon points={star(30, 90, 4, 1.8, 5)} fill={fg} opacity="0.4" />
    </g>
  );
}

// 5 Branches / nature
function PatternBranches({ fg }: P) {
  return (
    <g opacity="0.3" fill="none" stroke={fg} strokeLinecap="round">
      {/* main trunk */}
      <path d="M 140,144 C 140,110 135,90 140,60" strokeWidth="3" />
      {/* branches */}
      <path d="M 140,100 C 130,85 100,75 80,58" strokeWidth="2.5" />
      <path d="M 140,100 C 150,82 175,72 195,55" strokeWidth="2.5" />
      <path d="M 140,78 C 125,68 105,60 90,45" strokeWidth="2" />
      <path d="M 140,78 C 155,65 172,58 188,42" strokeWidth="2" />
      <path d="M 140,60 C 128,50 112,44 100,30" strokeWidth="1.5" />
      <path d="M 140,60 C 152,48 166,42 178,28" strokeWidth="1.5" />
      {/* leaves (small circles) */}
      {[[80,58],[195,55],[90,45],[188,42],[100,30],[178,28],[140,60]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r="5" fill={fg} stroke="none" opacity="0.7" />
      ))}
    </g>
  );
}

// 6 Scattered stars (night sky)
function PatternStars({ fg }: P) {
  const positions: [number, number, number][] = [
    [50, 28, 10], [110, 18, 8],  [175, 35, 12], [235, 22, 9],
    [28, 70, 7],  [85, 55, 11],  [148, 42, 8],  [205, 60, 10],
    [260, 48, 7], [65, 100, 9],  [130, 85, 7],  [200, 95, 11],
    [250, 112, 6],[35, 128, 8],  [160, 118, 9],
  ];
  return (
    <g opacity="0.35">
      {positions.map(([x, y, r], i) => (
        <polygon key={i} points={star(x, y, r, r * 0.4, 4)} fill={fg} />
      ))}
      {/* faint connecting lines for constellation effect */}
      <polyline points="50,28 110,18 175,35" fill="none" stroke={fg} strokeWidth="0.5" opacity="0.25" />
      <polyline points="85,55 148,42 205,60" fill="none" stroke={fg} strokeWidth="0.5" opacity="0.25" />
    </g>
  );
}

// 7 Islamic arch
function PatternArch({ fg }: P) {
  return (
    <g opacity="0.3" fill={fg}>
      {/* main arch */}
      <path d="M 80,144 L 80,95 Q 80,30 140,28 Q 200,30 200,95 L 200,144 Z" />
      {/* inner arch cutout */}
      <path d="M 95,144 L 95,100 Q 95,52 140,50 Q 185,52 185,100 L 185,144 Z" fill="none" stroke={fg} strokeWidth="1.5" />
      {/* decorative top circle */}
      <circle cx="140" cy="32" r="10" fill={fg} opacity="0.6" />
      {/* side pillars */}
      <rect x="72" y="100" width="10" height="44" rx="2" opacity="0.5" />
      <rect x="198" y="100" width="10" height="44" rx="2" opacity="0.5" />
      {/* decorative band */}
      <path d="M 82,108 Q 140,105 198,108" fill="none" stroke={fg} strokeWidth="1.5" opacity="0.6" />
      {/* small star on top */}
      <polygon points={star(140, 70, 10, 4, 8)} opacity="0.7" />
    </g>
  );
}

/* ── main component ──────────────────────────────────── */

const RENDERERS = [
  PatternStar, PatternRadial, PatternWaves, PatternMountains,
  PatternCrescent, PatternBranches, PatternStars, PatternArch,
];

interface Props {
  surahNumber: number;
  className?: string;
}

export default function SurahIllustration({ surahNumber, className = '' }: Props) {
  const { pattern, color } = getSurahTheme(surahNumber);
  const palette = PALETTES[color];
  const Renderer = RENDERERS[pattern];

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        background: `linear-gradient(135deg, ${palette.from}, ${palette.to})`,
      }}
    >
      <svg
        viewBox="0 0 280 144"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <Renderer fg={palette.fg} />
      </svg>
    </div>
  );
}
