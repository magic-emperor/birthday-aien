import { useEffect, useState } from "react";
import FallingPetal from "./FallingPetal";

// Branch paths with natural curves for leaf/blossom placement
const branchPaths: Array<{ points: [number, number][]; spread: number; density: number }> = [
  // Left sweeping main
  { points: [[228,345],[195,315],[155,288],[115,262],[78,248],[45,240],[18,238]], spread: 30, density: 95 },
  // Right sweeping main
  { points: [[268,330],[305,300],[348,272],[392,252],[432,238],[462,232],[488,235]], spread: 30, density: 95 },
  // Left upper
  { points: [[192,205],[168,178],[142,152],[118,128],[98,108],[82,90],[68,72]], spread: 26, density: 85 },
  // Right upper
  { points: [[308,205],[332,178],[358,152],[382,128],[402,108],[418,90],[432,72]], spread: 26, density: 85 },
  // Center top
  { points: [[248,210],[246,178],[243,145],[240,112],[236,80],[232,52],[228,28]], spread: 24, density: 75 },
  // Left mid
  { points: [[225,300],[202,288],[178,278],[152,272],[128,268]], spread: 24, density: 65 },
  // Right mid
  { points: [[272,295],[298,278],[325,265],[352,252],[378,242]], spread: 24, density: 65 },
  // Trunk fork left
  { points: [[245,280],[232,258],[220,238],[208,222],[195,208]], spread: 18, density: 35 },
  // Trunk fork right
  { points: [[255,280],[268,258],[280,238],[292,222],[305,208]], spread: 18, density: 35 },
  // Secondary left
  { points: [[155,288],[135,272],[112,268],[92,275],[75,285]], spread: 22, density: 50 },
  { points: [[78,248],[58,232],[42,210],[35,188],[30,162]], spread: 22, density: 50 },
  { points: [[78,248],[62,262],[48,278]], spread: 20, density: 32 },
  { points: [[98,108],[80,88],[62,68],[50,50],[42,32]], spread: 20, density: 42 },
  { points: [[98,108],[115,88],[132,65],[142,42],[148,22]], spread: 20, density: 42 },
  { points: [[68,72],[52,52],[38,35]], spread: 16, density: 25 },
  { points: [[68,72],[80,48],[92,28]], spread: 16, density: 25 },
  // Secondary right
  { points: [[402,108],[420,88],[442,65],[458,48],[472,32]], spread: 20, density: 42 },
  { points: [[402,108],[388,82],[372,58],[362,38],[355,18]], spread: 20, density: 42 },
  { points: [[432,72],[448,52],[462,35]], spread: 16, density: 25 },
  { points: [[432,72],[420,48],[410,25]], spread: 16, density: 25 },
  { points: [[432,238],[455,218],[475,195],[490,178],[502,158]], spread: 22, density: 50 },
  { points: [[432,238],[452,248],[468,258]], spread: 16, density: 25 },
  { points: [[378,242],[395,222],[408,200]], spread: 16, density: 25 },
  // Top sub-branches
  { points: [[236,80],[220,55],[205,35],[195,18],[188,-2]], spread: 16, density: 32 },
  { points: [[236,80],[252,55],[268,38],[282,22],[295,10]], spread: 16, density: 32 },
  { points: [[243,145],[225,128],[208,118]], spread: 15, density: 25 },
  { points: [[243,145],[260,122],[278,112]], spread: 15, density: 25 },
  // Left secondary sub
  { points: [[128,268],[112,260],[95,262]], spread: 15, density: 20 },
  { points: [[128,268],[118,285],[110,300]], spread: 15, density: 20 },
  { points: [[18,238],[2,228],[-10,215]], spread: 15, density: 20 },
  { points: [[18,238],[8,252],[0,268]], spread: 15, density: 20 },
  // Twigs
  { points: [[30,162],[18,142],[10,122]], spread: 13, density: 18 },
  { points: [[502,158],[512,138],[520,118]], spread: 13, density: 18 },
  // Far left drooping
  { points: [[18,238],[-5,248],[-25,262],[-40,278]], spread: 18, density: 35 },
  { points: [[18,238],[-10,232],[-30,225],[-45,220]], spread: 16, density: 30 },
  // Far right drooping
  { points: [[488,235],[508,245],[525,258],[538,272]], spread: 18, density: 35 },
  { points: [[488,235],[510,228],[528,222],[542,218]], spread: 16, density: 30 },
  // Extra left lower sub-branches
  { points: [[45,240],[28,252],[15,268],[5,282]], spread: 16, density: 28 },
  { points: [[115,262],[100,248],[82,238],[68,232]], spread: 16, density: 28 },
  { points: [[155,288],[145,302],[138,318],[132,332]], spread: 14, density: 22 },
  // Extra right lower sub-branches
  { points: [[462,232],[478,245],[492,260],[505,278]], spread: 16, density: 28 },
  { points: [[392,252],[408,242],[422,235],[435,230]], spread: 16, density: 28 },
  { points: [[348,272],[342,288],[338,305],[335,320]], spread: 14, density: 22 },
  // Extra upper sub-branches
  { points: [[142,152],[125,142],[108,138],[92,140]], spread: 16, density: 28 },
  { points: [[142,152],[148,135],[155,118],[160,102]], spread: 14, density: 22 },
  { points: [[358,152],[375,142],[392,138],[408,140]], spread: 16, density: 28 },
  { points: [[358,152],[352,135],[345,118],[340,102]], spread: 14, density: 22 },
  // Extra center canopy fill
  { points: [[248,210],[230,198],[212,190],[195,185]], spread: 18, density: 30 },
  { points: [[248,210],[268,198],[288,190],[305,185]], spread: 18, density: 30 },
  { points: [[240,112],[220,100],[200,92],[182,88]], spread: 16, density: 25 },
  { points: [[240,112],[260,100],[280,92],[298,88]], spread: 16, density: 25 },
  // Far upper left tips
  { points: [[42,32],[25,18],[12,5],[0,-8]], spread: 14, density: 20 },
  { points: [[148,22],[158,5],[165,-10],[170,-22]], spread: 14, density: 20 },
  // Far upper right tips
  { points: [[472,32],[485,18],[495,5],[502,-8]], spread: 14, density: 20 },
  { points: [[355,18],[345,5],[338,-10],[332,-22]], spread: 14, density: 20 },
  // Drooping mid branches
  { points: [[30,162],[15,172],[2,185],[-8,198]], spread: 14, density: 22 },
  { points: [[502,158],[515,168],[528,182],[538,198]], spread: 14, density: 22 },
];

function generateBlossomLeaves(count: number) {
  const pinks = [
    "hsl(340, 70%, 80%)", "hsl(335, 60%, 85%)", "hsl(338, 65%, 82%)",
    "hsl(340, 72%, 78%)", "hsl(335, 58%, 88%)", "hsl(342, 55%, 84%)",
    "hsl(337, 62%, 80%)", "hsl(340, 68%, 76%)", "hsl(345, 50%, 86%)",
    "hsl(340, 75%, 75%)", "hsl(338, 60%, 90%)", "hsl(342, 65%, 78%)",
  ];
  const leaves: Array<{x:number;y:number;rx:number;ry:number;angle:number;fill:string;opacity:number}> = [];
  const totalDensity = branchPaths.reduce((s, b) => s + b.density, 0);
  for (let i = 0; i < count; i++) {
    let r = Math.random() * totalDensity;
    let branch = branchPaths[0];
    for (const b of branchPaths) { r -= b.density; if (r <= 0) { branch = b; break; } }
    const pts = branch.points;
    const segIdx = Math.floor(Math.random() * (pts.length - 1));
    const t = Math.random();
    const px = pts[segIdx][0] + (pts[segIdx + 1][0] - pts[segIdx][0]) * t;
    const py = pts[segIdx][1] + (pts[segIdx + 1][1] - pts[segIdx][1]) * t;
    const dx = pts[segIdx + 1][0] - pts[segIdx][0];
    const dy = pts[segIdx + 1][1] - pts[segIdx][1];
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const offset = (Math.random() - 0.5) * 2 * branch.spread;
    const x = px + nx * offset + (Math.random() - 0.5) * 10;
    const y = py + ny * offset + (Math.random() - 0.5) * 10;
    const angle = Math.random() * 360;
    const rx = 4 + Math.random() * 7;
    const ry = rx * (0.35 + Math.random() * 0.2);
    leaves.push({
      x, y, rx, ry, angle,
      fill: pinks[Math.floor(Math.random() * pinks.length)],
      opacity: 0.45 + Math.random() * 0.45,
    });
  }
  return leaves;
}

const generatedLeaves = generateBlossomLeaves(4000);

const blossomClusters = [
  // TOP CENTER
  { x: 230, y: 28, r: 18, color: "hsl(340, 70%, 80%)", color2: "hsl(335, 60%, 88%)", opacity: 0.92 },
  { x: 250, y: 12, r: 16, color: "hsl(338, 65%, 82%)", color2: "hsl(340, 70%, 78%)", opacity: 0.9 },
  { x: 205, y: 18, r: 15, color: "hsl(340, 70%, 78%)", color2: "hsl(335, 60%, 85%)", opacity: 0.85 },
  { x: 275, y: 20, r: 14, color: "hsl(335, 60%, 85%)", color2: "hsl(340, 70%, 80%)", opacity: 0.86 },
  { x: 188, y: -2, r: 14, color: "hsl(340, 72%, 82%)", color2: "hsl(338, 65%, 88%)", opacity: 0.82 },
  { x: 298, y: 10, r: 13, color: "hsl(338, 68%, 80%)", color2: "hsl(340, 70%, 85%)", opacity: 0.84 },
  { x: 242, y: 68, r: 17, color: "hsl(340, 70%, 78%)", color2: "hsl(335, 60%, 85%)", opacity: 0.88 },
  { x: 260, y: 58, r: 14, color: "hsl(335, 60%, 88%)", color2: "hsl(340, 70%, 82%)", opacity: 0.82 },
  // LEFT UPPER
  { x: 98, y: 105, r: 22, color: "hsl(340, 70%, 78%)", color2: "hsl(335, 60%, 85%)", opacity: 0.92 },
  { x: 68, y: 68, r: 19, color: "hsl(338, 65%, 82%)", color2: "hsl(340, 70%, 78%)", opacity: 0.9 },
  { x: 142, y: 148, r: 17, color: "hsl(335, 60%, 88%)", color2: "hsl(340, 70%, 82%)", opacity: 0.87 },
  { x: 130, y: 58, r: 16, color: "hsl(340, 72%, 80%)", color2: "hsl(335, 58%, 85%)", opacity: 0.84 },
  { x: 55, y: 52, r: 14, color: "hsl(338, 68%, 82%)", color2: "hsl(340, 70%, 80%)", opacity: 0.84 },
  { x: 42, y: 30, r: 13, color: "hsl(335, 60%, 85%)", color2: "hsl(340, 70%, 78%)", opacity: 0.8 },
  { x: 148, y: 20, r: 14, color: "hsl(340, 70%, 82%)", color2: "hsl(338, 65%, 88%)", opacity: 0.8 },
  { x: 92, y: 28, r: 13, color: "hsl(338, 66%, 80%)", color2: "hsl(340, 70%, 85%)", opacity: 0.78 },
  // RIGHT UPPER
  { x: 408, y: 105, r: 22, color: "hsl(340, 70%, 78%)", color2: "hsl(335, 60%, 85%)", opacity: 0.92 },
  { x: 435, y: 68, r: 19, color: "hsl(335, 60%, 88%)", color2: "hsl(340, 70%, 78%)", opacity: 0.9 },
  { x: 358, y: 148, r: 17, color: "hsl(340, 70%, 82%)", color2: "hsl(338, 65%, 88%)", opacity: 0.87 },
  { x: 378, y: 58, r: 16, color: "hsl(338, 68%, 82%)", color2: "hsl(340, 70%, 80%)", opacity: 0.84 },
  { x: 450, y: 55, r: 14, color: "hsl(340, 70%, 80%)", color2: "hsl(335, 60%, 85%)", opacity: 0.84 },
  { x: 468, y: 30, r: 13, color: "hsl(335, 62%, 85%)", color2: "hsl(340, 70%, 78%)", opacity: 0.8 },
  { x: 358, y: 18, r: 14, color: "hsl(340, 70%, 82%)", color2: "hsl(338, 65%, 88%)", opacity: 0.8 },
  { x: 415, y: 22, r: 13, color: "hsl(338, 66%, 82%)", color2: "hsl(340, 70%, 80%)", opacity: 0.78 },
  // LEFT LOWER
  { x: 72, y: 248, r: 26, color: "hsl(340, 70%, 78%)", color2: "hsl(335, 60%, 85%)", opacity: 0.92 },
  { x: 115, y: 268, r: 20, color: "hsl(338, 65%, 82%)", color2: "hsl(340, 70%, 78%)", opacity: 0.9 },
  { x: 42, y: 208, r: 19, color: "hsl(335, 60%, 85%)", color2: "hsl(340, 70%, 82%)", opacity: 0.88 },
  { x: 30, y: 162, r: 18, color: "hsl(340, 72%, 80%)", color2: "hsl(335, 58%, 85%)", opacity: 0.86 },
  { x: 152, y: 282, r: 19, color: "hsl(340, 70%, 80%)", color2: "hsl(335, 60%, 88%)", opacity: 0.86 },
  { x: 18, y: 238, r: 17, color: "hsl(338, 68%, 82%)", color2: "hsl(340, 70%, 78%)", opacity: 0.85 },
  { x: -5, y: 215, r: 15, color: "hsl(340, 70%, 78%)", color2: "hsl(335, 60%, 85%)", opacity: 0.82 },
  { x: 10, y: 118, r: 14, color: "hsl(340, 70%, 82%)", color2: "hsl(335, 60%, 88%)", opacity: 0.8 },
  // RIGHT LOWER
  { x: 445, y: 238, r: 26, color: "hsl(340, 70%, 78%)", color2: "hsl(335, 60%, 85%)", opacity: 0.92 },
  { x: 482, y: 198, r: 20, color: "hsl(335, 60%, 88%)", color2: "hsl(340, 70%, 78%)", opacity: 0.9 },
  { x: 508, y: 158, r: 18, color: "hsl(340, 72%, 80%)", color2: "hsl(335, 58%, 85%)", opacity: 0.88 },
  { x: 382, y: 242, r: 18, color: "hsl(340, 70%, 82%)", color2: "hsl(338, 65%, 88%)", opacity: 0.88 },
  { x: 492, y: 235, r: 15, color: "hsl(338, 68%, 82%)", color2: "hsl(340, 70%, 80%)", opacity: 0.84 },
  { x: 522, y: 118, r: 13, color: "hsl(340, 70%, 78%)", color2: "hsl(338, 65%, 85%)", opacity: 0.8 },
  { x: 418, y: 202, r: 15, color: "hsl(338, 66%, 80%)", color2: "hsl(340, 70%, 85%)", opacity: 0.84 },
  // MID CANOPY
  { x: 195, y: 212, r: 19, color: "hsl(340, 70%, 80%)", color2: "hsl(335, 60%, 88%)", opacity: 0.9 },
  { x: 312, y: 212, r: 18, color: "hsl(335, 60%, 85%)", color2: "hsl(340, 70%, 78%)", opacity: 0.88 },
  { x: 252, y: 172, r: 17, color: "hsl(340, 70%, 82%)", color2: "hsl(335, 60%, 88%)", opacity: 0.82 },
  { x: 225, y: 155, r: 15, color: "hsl(335, 60%, 85%)", color2: "hsl(340, 70%, 78%)", opacity: 0.84 },
  { x: 280, y: 145, r: 15, color: "hsl(340, 70%, 78%)", color2: "hsl(338, 65%, 85%)", opacity: 0.84 },
  { x: 175, y: 188, r: 15, color: "hsl(340, 70%, 82%)", color2: "hsl(335, 60%, 85%)", opacity: 0.82 },
  { x: 335, y: 182, r: 14, color: "hsl(335, 60%, 88%)", color2: "hsl(340, 70%, 82%)", opacity: 0.8 },
  { x: 205, y: 118, r: 14, color: "hsl(340, 72%, 80%)", color2: "hsl(335, 58%, 85%)", opacity: 0.8 },
  { x: 285, y: 115, r: 14, color: "hsl(338, 66%, 82%)", color2: "hsl(340, 70%, 80%)", opacity: 0.8 },
  { x: 130, y: 272, r: 15, color: "hsl(340, 70%, 78%)", color2: "hsl(338, 65%, 85%)", opacity: 0.8 },
  { x: 345, y: 258, r: 15, color: "hsl(338, 68%, 82%)", color2: "hsl(340, 70%, 80%)", opacity: 0.8 },
];

interface PlumBlossomTreeProps {
  className?: string;
}

const PlumBlossomTree: React.FC<PlumBlossomTreeProps> = ({ className = '' }) => {
  const [petals, setPetals] = useState<Array<{ id: number; left: number; delay: number; duration: number; size: number; shade: number }>>([]);

  useEffect(() => {
    setPetals(Array.from({ length: 80 }, (_, i) => ({
      id: i,
      left: 5 + Math.random() * 90,
      delay: Math.random() * 14,
      duration: 5 + Math.random() * 8,
      size: 6 + Math.random() * 18,
      shade: Math.floor(Math.random() * 3),
    })));
  }, []);

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* Tree */}
      <div className="absolute bottom-[8%] left-1/2 -translate-x-1/2" style={{ width: '100%', maxWidth: '650px' }}>
        <svg width="100%" viewBox="-80 -40 710 700" className="drop-shadow-lg" preserveAspectRatio="xMidYMax meet">
          <defs>
            <linearGradient id="barkMain" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(25, 30%, 22%)" />
              <stop offset="100%" stopColor="hsl(25, 28%, 18%)" />
            </linearGradient>
          </defs>

          {/* === ROOT SYSTEM === */}
          <path d="M215 622 Q192 618 168 620 Q148 624 132 630" stroke="hsl(25, 28%, 22%)" strokeWidth="11" fill="none" strokeLinecap="round"/>
          <path d="M285 622 Q308 618 332 620 Q352 624 368 630" stroke="hsl(25, 28%, 22%)" strokeWidth="10" fill="none" strokeLinecap="round"/>
          <path d="M232 625 Q210 628 190 635" stroke="hsl(25, 28%, 24%)" strokeWidth="6" fill="none" strokeLinecap="round"/>
          <path d="M268 625 Q290 628 308 632" stroke="hsl(25, 28%, 24%)" strokeWidth="5" fill="none" strokeLinecap="round"/>
          <ellipse cx="250" cy="620" rx="68" ry="15" fill="hsl(25, 28%, 20%)" opacity="0.85"/>
          <ellipse cx="250" cy="618" rx="48" ry="8" fill="hsl(100, 28%, 35%)" opacity="0.4"/>
          <ellipse cx="225" cy="622" rx="22" ry="5" fill="hsl(105, 25%, 38%)" opacity="0.3"/>

          {/* === MAIN TRUNK === */}
          <path d="M232 622 Q226 580 222 540 Q216 490 210 440 Q204 395 206 355 Q210 315 216 282 Q220 255 226 228 Q230 210 232 195
                   L268 195
                   Q270 210 274 228 Q278 255 282 282 Q286 315 288 355 Q290 395 286 440 Q280 490 274 540 Q270 580 268 622 Z" 
                fill="hsl(25, 30%, 22%)"/>
          <path d="M238 620 Q234 578 232 538 Q228 488 224 438 Q220 398 222 358 Q226 318 230 288 Q234 260 238 235 Q242 215 244 200
                   L256 200
                   Q258 215 262 235 Q266 260 268 288 Q272 318 274 358 Q276 398 272 438 Q268 488 264 538 Q260 578 258 620 Z" 
                fill="hsl(25, 28%, 26%)"/>
          <path d="M246 600 Q242 555 240 510 Q236 460 234 415 Q232 375 235 345" 
                stroke="hsl(25, 25%, 32%)" strokeWidth="9" fill="none" opacity="0.35" strokeLinecap="round"/>
          <path d="M242 595 Q238 545 236 495 Q234 445 233 400" stroke="hsl(25, 20%, 17%)" strokeWidth="2.5" fill="none" opacity="0.45"/>
          <path d="M258 590 Q260 540 262 490 Q264 440 263 395" stroke="hsl(25, 20%, 17%)" strokeWidth="2" fill="none" opacity="0.4"/>
          <path d="M250 575 Q248 525 247 475 Q246 425 247 380" stroke="hsl(25, 22%, 19%)" strokeWidth="1.5" fill="none" opacity="0.3"/>
          <path d="M244 565 Q242 515 241 465" stroke="hsl(25, 18%, 16%)" strokeWidth="1.2" fill="none" opacity="0.25"/>
          {/* Knots */}
          <ellipse cx="240" cy="430" rx="9" ry="7" fill="hsl(25, 28%, 18%)" opacity="0.5"/>
          <ellipse cx="258" cy="365" rx="7" ry="5" fill="hsl(25, 28%, 18%)" opacity="0.4"/>
          <ellipse cx="245" cy="500" rx="6" ry="4" fill="hsl(25, 26%, 19%)" opacity="0.35"/>

          {/* === TRUNK FORK === */}
          <path d="M245 290 Q235 265 222 245 Q210 228 198 215 Q190 208 185 202" 
                stroke="hsl(25, 30%, 22%)" strokeWidth="20" fill="none" strokeLinecap="round"/>
          <path d="M255 290 Q265 265 278 245 Q290 228 302 215 Q310 208 315 202" 
                stroke="hsl(25, 30%, 22%)" strokeWidth="18" fill="none" strokeLinecap="round"/>

          {/* === LEFT BRANCHES === */}
          <g className="branch-sway-left">
            <path d="M228 350 Q200 325 172 305 Q142 288 112 272 Q85 258 58 250 Q35 244 18 245" stroke="hsl(25, 30%, 23%)" strokeWidth="18" fill="none" strokeLinecap="round"/>
            <path d="M225 308 Q200 295 175 285 Q152 278 132 275 Q118 272 108 272" stroke="hsl(25, 28%, 27%)" strokeWidth="9" fill="none" strokeLinecap="round"/>
            <path d="M155 295 Q138 278 118 275 Q98 278 82 288" stroke="hsl(25, 28%, 28%)" strokeWidth="7" fill="none" strokeLinecap="round"/>
            <path d="M78 252 Q62 238 48 218 Q38 198 34 178 Q32 165 30 152" stroke="hsl(25, 28%, 28%)" strokeWidth="7" fill="none" strokeLinecap="round"/>
            <path d="M78 255 Q65 268 55 282 Q48 292 44 300" stroke="hsl(25, 28%, 28%)" strokeWidth="6" fill="none" strokeLinecap="round"/>
            <path d="M128 275 Q115 265 100 265 Q88 268 78 275" stroke="hsl(25, 28%, 30%)" strokeWidth="5" fill="none" strokeLinecap="round"/>
            <path d="M128 278 Q120 292 115 305 Q112 315 110 322" stroke="hsl(25, 28%, 30%)" strokeWidth="4" fill="none" strokeLinecap="round"/>
            <path d="M18 242 Q5 232 -8 222 Q-15 215 -20 208" stroke="hsl(25, 28%, 30%)" strokeWidth="4.5" fill="none" strokeLinecap="round"/>
            <path d="M18 248 Q8 262 2 275 Q-2 285 -5 292" stroke="hsl(25, 28%, 30%)" strokeWidth="4" fill="none" strokeLinecap="round"/>
            <path d="M30 158 Q20 142 14 125 Q10 115 8 105" stroke="hsl(25, 25%, 32%)" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
            <path d="M82 290 Q72 305 68 318 Q66 328 65 335" stroke="hsl(25, 25%, 32%)" strokeWidth="3" fill="none" strokeLinecap="round"/>
            <path d="M44 302 Q35 315 30 328" stroke="hsl(25, 25%, 32%)" strokeWidth="3" fill="none" strokeLinecap="round"/>
            <path d="M18 238 Q-5 248 -25 262 Q-35 272 -40 278" stroke="hsl(25, 28%, 28%)" strokeWidth="5" fill="none" strokeLinecap="round"/>
            <path d="M18 238 Q-10 232 -30 225 Q-40 222 -45 220" stroke="hsl(25, 28%, 30%)" strokeWidth="4.5" fill="none" strokeLinecap="round"/>
            <path d="M45 240 Q28 252 15 268 Q8 278 5 282" stroke="hsl(25, 28%, 30%)" strokeWidth="4" fill="none" strokeLinecap="round"/>
            <path d="M115 262 Q100 248 82 238 Q72 234 68 232" stroke="hsl(25, 28%, 30%)" strokeWidth="5" fill="none" strokeLinecap="round"/>
            <path d="M155 288 Q145 302 138 318 Q135 328 132 332" stroke="hsl(25, 25%, 32%)" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
            <path d="M30 162 Q15 172 2 185 Q-5 195 -8 198" stroke="hsl(25, 25%, 32%)" strokeWidth="3" fill="none" strokeLinecap="round"/>
          </g>

          {/* === RIGHT BRANCHES === */}
          <g className="branch-sway-right">
            <path d="M268 338 Q298 312 330 290 Q362 270 395 258 Q422 248 448 242 Q470 238 488 242" stroke="hsl(25, 30%, 23%)" strokeWidth="16" fill="none" strokeLinecap="round"/>
            <path d="M272 302 Q298 285 325 272 Q348 260 372 250 Q388 245 398 242" stroke="hsl(25, 28%, 27%)" strokeWidth="9" fill="none" strokeLinecap="round"/>
            <path d="M448 245 Q465 228 480 208 Q492 192 500 175 Q508 162 512 148" stroke="hsl(25, 28%, 28%)" strokeWidth="7" fill="none" strokeLinecap="round"/>
            <path d="M452 248 Q465 258 475 268 Q482 275 488 282" stroke="hsl(25, 28%, 28%)" strokeWidth="5" fill="none" strokeLinecap="round"/>
            <path d="M398 245 Q408 228 418 212 Q425 200 430 190" stroke="hsl(25, 28%, 30%)" strokeWidth="5" fill="none" strokeLinecap="round"/>
            <path d="M395 248 Q400 262 405 275 Q408 285 410 292" stroke="hsl(25, 28%, 30%)" strokeWidth="4" fill="none" strokeLinecap="round"/>
            <path d="M512 152 Q518 138 522 122 Q525 112 526 102" stroke="hsl(25, 25%, 32%)" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
            <path d="M488 285 Q495 292 500 300" stroke="hsl(25, 25%, 32%)" strokeWidth="3" fill="none" strokeLinecap="round"/>
            <path d="M488 235 Q508 245 525 258 Q535 268 538 272" stroke="hsl(25, 28%, 28%)" strokeWidth="5" fill="none" strokeLinecap="round"/>
            <path d="M488 235 Q510 228 528 222 Q538 220 542 218" stroke="hsl(25, 28%, 30%)" strokeWidth="4.5" fill="none" strokeLinecap="round"/>
            <path d="M462 232 Q478 245 492 260 Q502 272 505 278" stroke="hsl(25, 28%, 30%)" strokeWidth="4" fill="none" strokeLinecap="round"/>
            <path d="M392 252 Q408 242 422 235 Q432 232 435 230" stroke="hsl(25, 28%, 30%)" strokeWidth="5" fill="none" strokeLinecap="round"/>
            <path d="M348 272 Q342 288 338 305 Q336 315 335 320" stroke="hsl(25, 25%, 32%)" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
            <path d="M502 158 Q515 168 528 182 Q535 192 538 198" stroke="hsl(25, 25%, 32%)" strokeWidth="3" fill="none" strokeLinecap="round"/>
          </g>

          {/* === UPPER LEFT BRANCHES === */}
          <g className="branch-sway-left" style={{animationDuration: "6s"}}>
            <path d="M192 208 Q172 185 152 165 Q135 148 118 132 Q102 118 88 102 Q78 90 70 78 Q65 70 62 62" stroke="hsl(25, 28%, 26%)" strokeWidth="12" fill="none" strokeLinecap="round"/>
            <path d="M98 108 Q82 90 68 72 Q55 55 48 42 Q42 32 38 22" stroke="hsl(25, 28%, 28%)" strokeWidth="6" fill="none" strokeLinecap="round"/>
            <path d="M98 112 Q115 92 132 72 Q142 55 150 38 Q155 25 158 15" stroke="hsl(25, 28%, 28%)" strokeWidth="6" fill="none" strokeLinecap="round"/>
            <path d="M62 68 Q50 52 40 38 Q32 25 28 15" stroke="hsl(25, 28%, 30%)" strokeWidth="5" fill="none" strokeLinecap="round"/>
            <path d="M65 72 Q75 52 88 35 Q95 25 100 18" stroke="hsl(25, 28%, 30%)" strokeWidth="4.5" fill="none" strokeLinecap="round"/>
            <path d="M243 148 Q228 132 215 122 Q205 115 195 110" stroke="hsl(25, 28%, 30%)" strokeWidth="5" fill="none" strokeLinecap="round"/>
            <path d="M38 22 Q28 10 20 -2" stroke="hsl(25, 25%, 33%)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
            <path d="M158 15 Q165 2 170 -10" stroke="hsl(25, 25%, 33%)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
            <path d="M142 152 Q125 142 108 138 Q98 138 92 140" stroke="hsl(25, 28%, 30%)" strokeWidth="5" fill="none" strokeLinecap="round"/>
            <path d="M142 152 Q148 135 155 118 Q158 108 160 102" stroke="hsl(25, 28%, 30%)" strokeWidth="4" fill="none" strokeLinecap="round"/>
            <path d="M42 32 Q25 18 12 5 Q5 -2 0 -8" stroke="hsl(25, 25%, 33%)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
            <path d="M148 22 Q158 5 165 -10 Q168 -18 170 -22" stroke="hsl(25, 25%, 33%)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          </g>

          {/* === UPPER RIGHT BRANCHES === */}
          <g className="branch-sway-right" style={{animationDuration: "6.5s"}}>
            <path d="M308 208 Q328 185 348 165 Q365 148 382 132 Q398 118 412 102 Q422 90 430 78 Q435 70 438 62" stroke="hsl(25, 28%, 26%)" strokeWidth="11" fill="none" strokeLinecap="round"/>
            <path d="M412 108 Q428 90 442 72 Q455 55 465 42 Q472 30 478 20" stroke="hsl(25, 28%, 28%)" strokeWidth="6" fill="none" strokeLinecap="round"/>
            <path d="M408 112 Q392 88 378 65 Q368 48 362 32 Q358 20 356 12" stroke="hsl(25, 28%, 28%)" strokeWidth="6" fill="none" strokeLinecap="round"/>
            <path d="M438 68 Q448 52 458 38 Q465 28 470 18" stroke="hsl(25, 28%, 30%)" strokeWidth="5" fill="none" strokeLinecap="round"/>
            <path d="M435 72 Q425 52 418 35 Q412 22 408 12" stroke="hsl(25, 28%, 30%)" strokeWidth="4.5" fill="none" strokeLinecap="round"/>
            <path d="M245 148 Q262 128 278 118 Q290 112 300 108" stroke="hsl(25, 28%, 30%)" strokeWidth="5" fill="none" strokeLinecap="round"/>
            <path d="M478 20 Q485 8 490 -5" stroke="hsl(25, 25%, 33%)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
            <path d="M356 12 Q348 -2 342 -12" stroke="hsl(25, 25%, 33%)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
            <path d="M358 152 Q375 142 392 138 Q402 138 408 140" stroke="hsl(25, 28%, 30%)" strokeWidth="5" fill="none" strokeLinecap="round"/>
            <path d="M358 152 Q352 135 345 118 Q342 108 340 102" stroke="hsl(25, 28%, 30%)" strokeWidth="4" fill="none" strokeLinecap="round"/>
            <path d="M472 32 Q485 18 495 5 Q500 -2 502 -8" stroke="hsl(25, 25%, 33%)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
            <path d="M355 18 Q345 5 338 -10 Q335 -18 332 -22" stroke="hsl(25, 25%, 33%)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          </g>

          {/* === CENTER TOP BRANCHES === */}
          <g className="branch-sway-top">
            <path d="M250 218 Q248 188 245 158 Q243 130 241 105 Q239 82 237 62 Q235 45 233 32 Q231 22 230 12" stroke="hsl(25, 28%, 26%)" strokeWidth="10" fill="none" strokeLinecap="round"/>
            <path d="M237 72 Q222 52 210 35 Q200 22 192 10 Q188 2 185 -8" stroke="hsl(25, 28%, 30%)" strokeWidth="5" fill="none" strokeLinecap="round"/>
            <path d="M238 78 Q255 58 272 42 Q285 28 295 18 Q302 10 308 2" stroke="hsl(25, 28%, 30%)" strokeWidth="5" fill="none" strokeLinecap="round"/>
            <path d="M308 2 Q318 -8 325 -15" stroke="hsl(25, 25%, 33%)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
            <path d="M185 -8 Q178 -18 172 -28" stroke="hsl(25, 25%, 33%)" strokeWidth="2" fill="none" strokeLinecap="round"/>
            <path d="M248 210 Q230 198 212 190 Q202 188 195 185" stroke="hsl(25, 28%, 30%)" strokeWidth="5" fill="none" strokeLinecap="round"/>
            <path d="M248 210 Q268 198 288 190 Q298 188 305 185" stroke="hsl(25, 28%, 30%)" strokeWidth="5" fill="none" strokeLinecap="round"/>
            <path d="M240 112 Q220 100 200 92 Q190 90 182 88" stroke="hsl(25, 28%, 30%)" strokeWidth="4" fill="none" strokeLinecap="round"/>
            <path d="M240 112 Q260 100 280 92 Q290 90 298 88" stroke="hsl(25, 28%, 30%)" strokeWidth="4" fill="none" strokeLinecap="round"/>
          </g>

          {/* === BLOSSOM PETALS === */}
          {generatedLeaves.map((l, i) => (
            <ellipse
              key={`bl-${i}`}
              cx={l.x}
              cy={l.y}
              rx={l.rx}
              ry={l.ry}
              fill={l.fill}
              opacity={l.opacity}
              transform={`rotate(${l.angle}, ${l.x}, ${l.y})`}
            />
          ))}

          {/* === BLOSSOM CLUSTERS === */}
          {blossomClusters.map((c, i) => (
            <g key={i}>
              <circle cx={c.x} cy={c.y} r={c.r} fill={c.color} opacity={c.opacity} />
              <circle cx={c.x + c.r * 0.65} cy={c.y - c.r * 0.45} r={c.r * 0.7} fill={c.color2} opacity={c.opacity - 0.05} />
              <circle cx={c.x - c.r * 0.55} cy={c.y + c.r * 0.4} r={c.r * 0.6} fill={c.color} opacity={c.opacity - 0.08} />
              <circle cx={c.x + c.r * 0.25} cy={c.y + c.r * 0.65} r={c.r * 0.45} fill={c.color2} opacity={c.opacity - 0.1} />
              <circle cx={c.x - c.r * 0.35} cy={c.y - c.r * 0.55} r={c.r * 0.5} fill={c.color} opacity={c.opacity - 0.07} />
              <circle cx={c.x} cy={c.y} r={c.r * 0.14} fill="hsl(45, 80%, 70%)" opacity={0.6} />
            </g>
          ))}
        </svg>
      </div>

      {/* Falling petals */}
      {petals.map((p) => (
        <FallingPetal key={p.id} {...p} />
      ))}
    </div>
  );
};

export default PlumBlossomTree;
