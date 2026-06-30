// ===== 南北朝卡牌博弈 — SVG图标生成器（水墨风格） =====
// 运行: node generate_card_icons.js

const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, 'assets', 'cards');

// SVG公共样式头/尾
function svgWrap(content, bgColor) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <filter id="ink-${Math.random().toString(36).slice(2,6)}">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise"/>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
  </defs>
  ${bgColor ? `<rect width="120" height="120" fill="${bgColor}" rx="8"/>` : '<rect width="120" height="120" fill="none"/>'}
  <g fill="none" stroke-linecap="round" stroke-linejoin="round">
${content}
  </g>
</svg>`;
}

// 墨色系
const INK = {
    black:   '#1a1a1a',
    dark:    '#333333',
    mid:     '#555555',
    light:   '#888888',
    pale:    '#aaaaaa',
    wash:    '#cccccc',
    faint:   '#e0e0e0',
    white:   '#f5f5f0',
};

// ============================================================
// 领袖卡 (Leaders: L1-L7)
// ============================================================

const leaderIcons = {
    // L1 刘裕 — 战斧 (步兵统帅)
    L1: `
    <line x1="60" y1="18" x2="60" y2="82" stroke="${INK.dark}" stroke-width="5"/>
    <path d="M38 25 Q42 22 60 20 Q78 22 82 25 L85 35 Q80 38 60 36 Q40 38 35 35 Z"
          fill="${INK.mid}" stroke="${INK.black}" stroke-width="1.5" opacity="0.85"/>
    <path d="M35 32 L28 40 L40 36" fill="${INK.dark}" stroke="${INK.black}" stroke-width="1" opacity="0.7"/>
    <path d="M85 32 L92 40 L80 36" fill="${INK.dark}" stroke="${INK.black}" stroke-width="1" opacity="0.7"/>
    <path d="M52 78 Q60 88 68 78 Q65 85 60 90 Q55 85 52 78Z"
          fill="${INK.light}" stroke="${INK.mid}" stroke-width="1" opacity="0.6"/>
    <line x1="55" y1="50" x2="65" y2="50" stroke="${INK.light}" stroke-width="1" opacity="0.4"/>`,

    // L2 萧衍 — 佛卷/棋盘 (牺牲抽牌)
    L2: `
    <path d="M30 90 Q30 30 60 28 Q90 30 90 90" fill="none" stroke="${INK.mid}" stroke-width="2" opacity="0.5"/>
    <path d="M30 90 Q60 85 90 90" fill="${INK.wash}" stroke="${INK.light}" stroke-width="1.5" opacity="0.6"/>
    <rect x="40" y="35" width="40" height="45" rx="2" fill="${INK.white}" stroke="${INK.dark}" stroke-width="1.5" opacity="0.9"/>
    <line x1="48" y1="45" x2="72" y2="45" stroke="${INK.light}" stroke-width="1" opacity="0.5"/>
    <line x1="48" y1="52" x2="72" y2="52" stroke="${INK.light}" stroke-width="1" opacity="0.5"/>
    <line x1="48" y1="59" x2="68" y2="59" stroke="${INK.light}" stroke-width="1" opacity="0.5"/>
    <line x1="48" y1="66" x2="72" y2="66" stroke="${INK.light}" stroke-width="1" opacity="0.5"/>
    <circle cx="60" cy="76" r="3" fill="${INK.mid}" opacity="0.6"/>
    <path d="M20 50 Q15 48 18 42 Q22 38 20 50Z" fill="${INK.faint}" stroke="${INK.pale}" stroke-width="0.8" opacity="0.4"/>
    <path d="M100 50 Q105 48 102 42 Q98 38 100 50Z" fill="${INK.faint}" stroke="${INK.pale}" stroke-width="0.8" opacity="0.4"/>`,

    // L3 陈庆之 — 骑兵长矛 (白袍军骑兵)
    L3: `
    <path d="M60 15 L63 55 L57 55 Z" fill="${INK.dark}" stroke="${INK.black}" stroke-width="1.5"/>
    <line x1="60" y1="55" x2="60" y2="95" stroke="${INK.dark}" stroke-width="3.5"/>
    <path d="M45 90 Q60 82 75 90" fill="none" stroke="${INK.mid}" stroke-width="2" opacity="0.5"/>
    <path d="M55 30 L45 25 L55 28" fill="${INK.light}" stroke="${INK.mid}" stroke-width="0.8" opacity="0.5"/>
    <path d="M30 70 Q35 65 40 68 Q38 74 32 75Z" fill="${INK.wash}" stroke="${INK.pale}" stroke-width="1" opacity="0.3"/>
    <path d="M85 65 Q82 60 78 63 Q80 68 86 70Z" fill="${INK.wash}" stroke="${INK.pale}" stroke-width="1" opacity="0.3"/>
    <circle cx="60" cy="18" r="2" fill="${INK.black}" opacity="0.8"/>`,

    // L4 拓跋宏 — 太极/转化之镜
    L4: `
    <circle cx="60" cy="60" r="32" fill="none" stroke="${INK.dark}" stroke-width="2.5"/>
    <path d="M60 28 A32 32 0 0 1 60 92 A16 16 0 0 0 60 60 A16 16 0 0 1 60 28Z" fill="${INK.dark}" opacity="0.7"/>
    <path d="M60 92 A32 32 0 0 1 60 28 A16 16 0 0 0 60 60 A16 16 0 0 1 60 92Z" fill="${INK.white}" stroke="${INK.mid}" stroke-width="1"/>
    <circle cx="60" cy="44" r="4" fill="${INK.white}" opacity="0.9"/>
    <circle cx="60" cy="76" r="4" fill="${INK.dark}" opacity="0.9"/>
    <path d="M28 60 Q40 45 50 55" fill="none" stroke="${INK.light}" stroke-width="1" opacity="0.4" stroke-dasharray="3,3"/>`,

    // L5 宇文泰 — 战鼓 (全场buff)
    L5: `
    <ellipse cx="60" cy="55" rx="28" ry="22" fill="${INK.wash}" stroke="${INK.dark}" stroke-width="2.5"/>
    <ellipse cx="60" cy="55" rx="28" ry="10" fill="${INK.white}" stroke="${INK.dark}" stroke-width="2"/>
    <line x1="32" y1="55" x2="32" y2="65" stroke="${INK.dark}" stroke-width="2"/>
    <line x1="88" y1="55" x2="88" y2="65" stroke="${INK.dark}" stroke-width="2"/>
    <line x1="32" y1="65" x2="88" y2="65" stroke="${INK.dark}" stroke-width="2" opacity="0.6"/>
    <line x1="45" y1="20" x2="50" y2="40" stroke="${INK.mid}" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="45" cy="18" r="4" fill="${INK.mid}" opacity="0.7"/>
    <line x1="75" y1="20" x2="70" y2="40" stroke="${INK.mid}" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="75" cy="18" r="4" fill="${INK.mid}" opacity="0.7"/>
    <path d="M40 55 Q50 50 60 55 Q70 50 80 55" fill="none" stroke="${INK.light}" stroke-width="1" opacity="0.3"/>
    <line x1="55" y1="78" x2="55" y2="95" stroke="${INK.mid}" stroke-width="2"/>
    <line x1="65" y1="78" x2="65" y2="95" stroke="${INK.mid}" stroke-width="2"/>`,

    // L6 萧道成 — 信鸽/飞鸟 (抽牌)
    L6: `
    <path d="M25 55 Q35 35 55 40 Q60 30 70 35 Q85 30 90 45 Q80 42 70 45 Q65 42 60 48 Q50 45 35 55Z"
          fill="${INK.mid}" stroke="${INK.dark}" stroke-width="1.5" opacity="0.8"/>
    <path d="M55 40 Q50 35 52 30 Q58 32 55 40Z" fill="${INK.dark}" opacity="0.9"/>
    <circle cx="62" cy="38" r="1.5" fill="${INK.black}"/>
    <path d="M70 45 Q85 55 95 50 Q85 60 75 55 Q80 65 90 72"
          fill="none" stroke="${INK.light}" stroke-width="2" opacity="0.5"/>
    <path d="M35 55 Q30 65 25 75 Q28 68 32 62Z" fill="${INK.light}" stroke="${INK.mid}" stroke-width="1" opacity="0.5"/>
    <path d="M45 70 Q50 80 55 90 Q48 82 42 72Z" fill="${INK.wash}" stroke="${INK.pale}" stroke-width="0.8" opacity="0.3"/>
    <path d="M65 70 Q62 82 60 95 Q58 82 62 72Z" fill="${INK.wash}" stroke="${INK.pale}" stroke-width="0.8" opacity="0.3"/>`,

    // L7 陈霸先 — 鼎/复活 (后手+1)
    L7: `
    <path d="M40 30 L38 65 Q38 72 45 72 L75 72 Q82 72 82 65 L80 30Z"
          fill="${INK.wash}" stroke="${INK.dark}" stroke-width="2.5" opacity="0.8"/>
    <path d="M40 30 L80 30" stroke="${INK.dark}" stroke-width="3"/>
    <path d="M45 72 L42 90 Q42 95 48 95 L72 95 Q78 95 78 90 L75 72"
          fill="${INK.light}" stroke="${INK.mid}" stroke-width="1.5" opacity="0.6"/>
    <line x1="38" y1="48" x2="82" y2="48" stroke="${INK.mid}" stroke-width="1" opacity="0.4"/>
    <line x1="38" y1="60" x2="82" y2="60" stroke="${INK.mid}" stroke-width="1" opacity="0.4"/>
    <path d="M30 30 L40 30 L40 35 L30 35Z" fill="${INK.mid}" opacity="0.7"/>
    <path d="M80 30 L90 30 L90 35 L80 35Z" fill="${INK.mid}" opacity="0.7"/>
    <path d="M50 40 Q60 36 70 40" fill="none" stroke="${INK.pale}" stroke-width="1" opacity="0.3"/>
    <path d="M48 52 Q60 48 72 52" fill="none" stroke="${INK.pale}" stroke-width="1" opacity="0.3"/>`,
};

// ============================================================
// 将领卡 (Generals: G01-G15)
// ============================================================

const generalIcons = {
    // G01 檀道济 — 量米斗 (唱筹量沙)
    G01: `
    <path d="M35 35 L85 35 L80 85 L40 85Z" fill="${INK.wash}" stroke="${INK.dark}" stroke-width="2.5" opacity="0.8"/>
    <path d="M35 35 L85 35" stroke="${INK.black}" stroke-width="3"/>
    <line x1="30" y1="35" x2="90" y2="35" stroke="${INK.dark}" stroke-width="2" opacity="0.6"/>
    <path d="M38 55 L82 55" fill="none" stroke="${INK.light}" stroke-width="1.5" opacity="0.5" stroke-dasharray="4,3"/>
    <path d="M40 70 L80 70" fill="none" stroke="${INK.light}" stroke-width="1.5" opacity="0.5" stroke-dasharray="4,3"/>
    <circle cx="55" cy="50" r="3" fill="${INK.mid}" opacity="0.6"/>
    <circle cx="65" cy="50" r="3" fill="${INK.mid}" opacity="0.6"/>
    <circle cx="60" cy="60" r="3" fill="${INK.mid}" opacity="0.6"/>
    <circle cx="50" cy="65" r="2" fill="${INK.light}" opacity="0.4"/>
    <circle cx="70" cy="62" r="2" fill="${INK.light}" opacity="0.4"/>`,

    // G02 刘义隆 — 军旗 (元嘉北伐)
    G02: `
    <line x1="40" y1="15" x2="40" y2="100" stroke="${INK.dark}" stroke-width="3"/>
    <path d="M42 15 L85 22 L82 45 L42 40Z" fill="${INK.mid}" stroke="${INK.dark}" stroke-width="1.5" opacity="0.75"/>
    <path d="M55 22 Q65 28 75 25" fill="none" stroke="${INK.light}" stroke-width="1" opacity="0.5"/>
    <path d="M55 30 Q65 36 72 33" fill="none" stroke="${INK.light}" stroke-width="1" opacity="0.5"/>
    <path d="M50 27 L58 27" stroke="${INK.white}" stroke-width="2" opacity="0.6"/>
    <path d="M38 80 L42 80 L40 95Z" fill="${INK.mid}" opacity="0.5"/>
    <path d="M88 55 Q92 50 96 55 Q92 60 88 55Z" fill="${INK.pale}" stroke="${INK.light}" stroke-width="0.5" opacity="0.3"/>`,

    // G03 韦睿 — 战船 (钟离大捷水军)
    G03: `
    <path d="M20 65 Q40 50 60 55 Q80 50 100 65 Q95 72 60 70 Q25 72 20 65Z"
          fill="${INK.mid}" stroke="${INK.dark}" stroke-width="2" opacity="0.8"/>
    <path d="M25 62 Q50 52 75 55 Q85 53 95 60" fill="none" stroke="${INK.light}" stroke-width="1" opacity="0.4"/>
    <line x1="60" y1="55" x2="60" y2="25" stroke="${INK.dark}" stroke-width="2.5"/>
    <path d="M62 25 Q80 30 85 40 L62 42Z" fill="${INK.light}" stroke="${INK.mid}" stroke-width="1" opacity="0.6"/>
    <path d="M30 72 Q35 80 25 88" fill="none" stroke="${INK.light}" stroke-width="1.5" opacity="0.5"/>
    <path d="M45 72 Q48 82 42 90" fill="none" stroke="${INK.light}" stroke-width="1.5" opacity="0.5"/>
    <path d="M70 72 Q73 82 68 88" fill="none" stroke="${INK.light}" stroke-width="1.5" opacity="0.5"/>`,

    // G04 谢安 — 山/松 (东山再起)
    G04: `
    <path d="M20 95 Q35 70 50 75 Q55 50 65 55 Q70 35 80 40 Q90 25 100 35 Q95 55 85 60 Q90 75 100 95Z"
          fill="${INK.wash}" stroke="${INK.mid}" stroke-width="2" opacity="0.6"/>
    <path d="M55 50 Q60 42 68 48 Q65 55 58 55Z" fill="${INK.dark}" opacity="0.5"/>
    <path d="M58 45 Q62 38 70 42 Q67 50 60 50Z" fill="${INK.mid}" opacity="0.4"/>
    <path d="M38 72 Q42 65 48 68 Q45 75 38 72Z" fill="${INK.light}" opacity="0.35"/>
    <line x1="55" y1="50" x2="52" y2="65" stroke="${INK.mid}" stroke-width="1.5" opacity="0.5"/>
    <path d="M15 95 L105 95" stroke="${INK.pale}" stroke-width="1" opacity="0.3"/>
    <path d="M30 88 Q35 82 40 85" fill="none" stroke="${INK.faint}" stroke-width="1" opacity="0.25"/>`,

    // G05 宗悫 — 浪花/风帆 (乘风破浪)
    G05: `
    <path d="M15 80 Q30 72 45 78 Q60 68 75 75 Q90 70 105 80"
          fill="none" stroke="${INK.dark}" stroke-width="2.5" opacity="0.8"/>
    <path d="M20 85 Q35 77 50 83 Q65 73 80 80 Q95 75 108 85"
          fill="none" stroke="${INK.mid}" stroke-width="2" opacity="0.5"/>
    <path d="M25 92 Q40 85 55 90 Q70 82 85 88 Q100 83 110 92"
          fill="none" stroke="${INK.light}" stroke-width="1.5" opacity="0.35"/>
    <path d="M58 20 L58 72" stroke="${INK.dark}" stroke-width="2"/>
    <path d="M60 20 Q75 30 78 50 L60 48Z" fill="${INK.light}" stroke="${INK.mid}" stroke-width="1" opacity="0.6"/>
    <path d="M56 20 L42 35 L56 40Z" fill="${INK.wash}" stroke="${INK.pale}" stroke-width="0.8" opacity="0.4"/>`,

    // G06 沈庆之 — 老弓 (老当益壮)
    G06: `
    <path d="M45 20 Q25 50 45 95" fill="none" stroke="${INK.dark}" stroke-width="3" stroke-linecap="round"/>
    <path d="M45 20 Q35 30 30 20" fill="none" stroke="${INK.mid}" stroke-width="2"/>
    <path d="M45 95 Q38 88 35 95" fill="none" stroke="${INK.mid}" stroke-width="2"/>
    <line x1="45" y1="20" x2="45" y2="95" stroke="${INK.mid}" stroke-width="1" opacity="0.5"/>
    <path d="M48 35 L90 55 L48 75" fill="none" stroke="${INK.light}" stroke-width="1.5" opacity="0.6"/>
    <line x1="48" y1="35" x2="48" y2="75" stroke="${INK.light}" stroke-width="1" opacity="0.4"/>
    <path d="M88 52 L95 55 L88 58" fill="${INK.mid}" opacity="0.6"/>
    <path d="M50 40 L82 55" fill="none" stroke="${INK.pale}" stroke-width="0.8" opacity="0.3"/>`,

    // G07 拓跋珪 — 双环 (代国复兴)
    G07: `
    <circle cx="48" cy="60" r="25" fill="none" stroke="${INK.dark}" stroke-width="2.5" opacity="0.8"/>
    <circle cx="72" cy="60" r="25" fill="none" stroke="${INK.mid}" stroke-width="2" opacity="0.6"/>
    <path d="M48 35 Q60 45 72 35" fill="none" stroke="${INK.light}" stroke-width="1" opacity="0.4"/>
    <path d="M48 85 Q60 75 72 85" fill="none" stroke="${INK.light}" stroke-width="1" opacity="0.4"/>
    <path d="M60 42 L60 78" fill="none" stroke="${INK.pale}" stroke-width="1" opacity="0.3" stroke-dasharray="3,3"/>
    <circle cx="60" cy="60" r="5" fill="${INK.mid}" opacity="0.5"/>
    <circle cx="60" cy="60" r="2" fill="${INK.dark}" opacity="0.7"/>`,

    // G08 拓跋焘 — 大弓 (太武灭国)
    G08: `
    <path d="M35 15 Q15 60 35 105" fill="none" stroke="${INK.black}" stroke-width="3.5" stroke-linecap="round"/>
    <line x1="35" y1="15" x2="35" y2="105" stroke="${INK.dark}" stroke-width="1" opacity="0.3"/>
    <path d="M38 18 L100 60 L38 102" fill="none" stroke="${INK.mid}" stroke-width="1.5" opacity="0.7"/>
    <path d="M38 25 L85 60 L38 95" fill="none" stroke="${INK.light}" stroke-width="1" opacity="0.4"/>
    <path d="M95 55 L105 60 L95 65" fill="${INK.dark}" opacity="0.8"/>
    <path d="M92 52 L102 60 L92 68" fill="none" stroke="${INK.mid}" stroke-width="1" opacity="0.5"/>
    <circle cx="105" cy="60" r="2" fill="${INK.black}"/>`,

    // G09 高欢 — 铁锤 (晋阳霸业)
    G09: `
    <line x1="55" y1="45" x2="50" y2="100" stroke="${INK.dark}" stroke-width="3.5"/>
    <path d="M30 20 Q35 15 75 15 Q80 15 85 20 L85 42 Q80 48 75 48 L35 48 Q30 48 25 42Z"
          fill="${INK.mid}" stroke="${INK.dark}" stroke-width="2" opacity="0.85"/>
    <path d="M30 20 L85 20" stroke="${INK.black}" stroke-width="2.5"/>
    <path d="M30 38 Q55 35 85 38" fill="none" stroke="${INK.light}" stroke-width="1" opacity="0.4"/>
    <path d="M48 25 L48 42" stroke="${INK.light}" stroke-width="1" opacity="0.3"/>
    <path d="M62 25 L62 42" stroke="${INK.light}" stroke-width="1" opacity="0.3"/>
    <path d="M50 98 Q48 105 52 108 Q56 105 54 98" fill="${INK.mid}" opacity="0.5"/>`,

    // G10 宇文邕 — 龙旗 (建德北伐)
    G10: `
    <line x1="30" y1="12" x2="30" y2="105" stroke="${INK.dark}" stroke-width="3"/>
    <path d="M32 12 L100 25 L95 60 L32 50Z" fill="${INK.wash}" stroke="${INK.dark}" stroke-width="1.5" opacity="0.7"/>
    <path d="M50 28 Q60 22 70 28 Q80 22 88 28" fill="none" stroke="${INK.mid}" stroke-width="1.5" opacity="0.5"/>
    <path d="M48 35 Q58 30 68 35 Q78 30 85 35" fill="none" stroke="${INK.light}" stroke-width="1" opacity="0.4"/>
    <path d="M45 42 Q55 38 65 42 Q72 38 80 42" fill="none" stroke="${INK.pale}" stroke-width="1" opacity="0.3"/>
    <path d="M28 12 L32 8 L34 12" fill="${INK.mid}" opacity="0.7"/>
    <path d="M95 55 L100 50 Q102 55 98 58Z" fill="${INK.light}" opacity="0.4"/>`,

    // G11 尔朱荣 — 刀 (河阴之变)
    G11: `
    <path d="M55 15 L55 60 L70 65 L55 55 L55 15Z" fill="${INK.mid}" stroke="${INK.dark}" stroke-width="2" opacity="0.85"/>
    <path d="M55 15 L55 60" stroke="${INK.black}" stroke-width="1.5" opacity="0.3"/>
    <line x1="45" y1="60" x2="65" y2="62" stroke="${INK.dark}" stroke-width="3"/>
    <path d="M52 62 L52 80 Q52 85 56 85 L60 85 Q64 85 64 80 L64 62"
          fill="${INK.wash}" stroke="${INK.mid}" stroke-width="1.5"/>
    <path d="M50 72 Q58 68 66 72" fill="none" stroke="${INK.light}" stroke-width="1" opacity="0.4"/>
    <path d="M48 18 Q55 10 62 18" fill="none" stroke="${INK.light}" stroke-width="1.5" opacity="0.5"/>
    <path d="M72 63 L78 60 Q80 63 76 66Z" fill="${INK.light}" opacity="0.4"/>`,

    // G12 侯景 — 双向箭头/叛旗 (反复无常)
    G12: `
    <path d="M30 60 L80 60" stroke="${INK.dark}" stroke-width="2.5"/>
    <path d="M75 52 L90 60 L75 68" fill="none" stroke="${INK.dark}" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M90 60 L40 60" stroke="${INK.mid}" stroke-width="2.5"/>
    <path d="M45 52 L30 60 L45 68" fill="none" stroke="${INK.mid}" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M55 35 L60 25 L65 35 L60 30Z" fill="${INK.mid}" opacity="0.5"/>
    <path d="M55 85 L60 95 L65 85 L60 90Z" fill="${INK.light}" opacity="0.4"/>
    <circle cx="60" cy="60" r="8" fill="none" stroke="${INK.light}" stroke-width="1" opacity="0.3"/>
    <path d="M48 48 Q60 42 72 48" fill="none" stroke="${INK.pale}" stroke-width="0.8" opacity="0.25"/>
    <path d="M48 72 Q60 78 72 72" fill="none" stroke="${INK.pale}" stroke-width="0.8" opacity="0.25"/>`,

    // G13 段韶 — 盾牌 (常胜将军/天气抵抗)
    G13: `
    <path d="M60 15 L90 30 L90 65 Q90 95 60 105 Q30 95 30 65 L30 30Z"
          fill="${INK.wash}" stroke="${INK.dark}" stroke-width="2.5" opacity="0.8"/>
    <path d="M60 15 L90 30 L90 65 Q90 95 60 105 Q30 95 30 65 L30 30 L60 15Z"
          fill="${INK.faint}" stroke="none" opacity="0.3"/>
    <path d="M45 35 L75 35 L75 70 Q75 90 60 96 Q45 90 45 70Z"
          fill="none" stroke="${INK.mid}" stroke-width="1.5" opacity="0.5"/>
    <path d="M55 45 L60 35 L65 45" fill="none" stroke="${INK.mid}" stroke-width="1.5" opacity="0.5"/>
    <line x1="60" y1="45" x2="60" y2="75" stroke="${INK.light}" stroke-width="1" opacity="0.3"/>
    <line x1="45" y1="60" x2="75" y2="60" stroke="${INK.light}" stroke-width="1" opacity="0.3"/>`,

    // G14 斛律光 — 雕/弓箭 (落雕都督)
    G14: `
    <path d="M25 55 Q35 30 55 35 Q60 25 70 30 Q85 25 90 40 Q75 38 65 42 Q55 35 40 50Z"
          fill="${INK.mid}" stroke="${INK.dark}" stroke-width="1.5" opacity="0.8"/>
    <path d="M55 35 Q50 28 53 22 Q58 25 55 35Z" fill="${INK.dark}" opacity="0.9"/>
    <circle cx="63" cy="33" r="1.5" fill="${INK.black}"/>
    <path d="M70 30 Q85 25 95 30 Q85 32 75 35" fill="${INK.light}" stroke="${INK.mid}" stroke-width="1" opacity="0.5"/>
    <path d="M25 55 Q30 65 25 80 Q28 70 30 60Z" fill="${INK.light}" stroke="${INK.mid}" stroke-width="1" opacity="0.5"/>
    <path d="M40 50 Q35 60 30 75" fill="none" stroke="${INK.light}" stroke-width="1.5" opacity="0.4"/>
    <path d="M90 38 L95 35 L98 38 L95 42Z" fill="${INK.mid}" opacity="0.5"/>
    <path d="M55 60 Q60 75 65 90" fill="none" stroke="${INK.pale}" stroke-width="1" opacity="0.3"/>`,

    // G15 王僧辩 — 城墙/长城 (江左长城)
    G15: `
    <rect x="20" y="50" width="80" height="35" fill="${INK.wash}" stroke="${INK.dark}" stroke-width="2" opacity="0.8"/>
    <path d="M20 50 L20 42 L30 42 L30 50 L40 50 L40 42 L50 42 L50 50 L60 50 L60 42 L70 42 L70 50 L80 50 L80 42 L90 42 L90 50 L100 50 L100 42 L100 50"
          fill="none" stroke="${INK.dark}" stroke-width="2" opacity="0.9"/>
    <rect x="25" y="60" width="12" height="15" rx="6" fill="${INK.mid}" opacity="0.5"/>
    <rect x="45" y="60" width="12" height="15" rx="6" fill="${INK.mid}" opacity="0.5"/>
    <rect x="65" y="60" width="12" height="15" rx="6" fill="${INK.mid}" opacity="0.5"/>
    <rect x="85" y="60" width="10" height="15" rx="5" fill="${INK.mid}" opacity="0.5"/>
    <line x1="20" y1="85" x2="100" y2="85" stroke="${INK.dark}" stroke-width="2"/>
    <path d="M25 90 Q50 88 75 90 Q100 88 110 92" fill="none" stroke="${INK.light}" stroke-width="1" opacity="0.3"/>
    <path d="M15 92 Q35 88 55 92 Q75 88 105 95" fill="none" stroke="${INK.pale}" stroke-width="1" opacity="0.2"/>`,
};

// ============================================================
// 士兵卡 (Soldiers: S01-S10)
// ============================================================

const soldierIcons = {
    // S01 北府兵 — 盾牌 (精锐步兵)
    S01: `
    <path d="M60 15 L90 30 L90 70 Q90 100 60 108 Q30 100 30 70 L30 30Z"
          fill="${INK.wash}" stroke="${INK.dark}" stroke-width="2.5" opacity="0.8"/>
    <path d="M60 25 L82 37 L82 67 Q82 92 60 98 Q38 92 38 67 L38 37Z"
          fill="none" stroke="${INK.mid}" stroke-width="1.5" opacity="0.5"/>
    <path d="M60 40 L60 82" stroke="${INK.light}" stroke-width="1" opacity="0.3"/>
    <path d="M42 60 L78 60" stroke="${INK.light}" stroke-width="1" opacity="0.3"/>
    <circle cx="60" cy="55" r="8" fill="none" stroke="${INK.mid}" stroke-width="1.5" opacity="0.4"/>
    <path d="M56 52 L60 48 L64 52 L60 56Z" fill="${INK.mid}" opacity="0.4"/>`,

    // S02 北府弓手 — 弓 (远程)
    S02: `
    <path d="M35 18 Q15 60 35 102" fill="none" stroke="${INK.dark}" stroke-width="3" stroke-linecap="round"/>
    <line x1="35" y1="18" x2="35" y2="102" stroke="${INK.mid}" stroke-width="1" opacity="0.4"/>
    <line x1="38" y1="22" x2="38" y2="98" stroke="${INK.mid}" stroke-width="1.5" opacity="0.7"/>
    <path d="M42 50 L85 55" stroke="${INK.mid}" stroke-width="1.5" opacity="0.6"/>
    <path d="M80 50 L90 55 L80 60" fill="${INK.mid}" opacity="0.7"/>
    <path d="M55 48 L58 44 L61 48" fill="none" stroke="${INK.light}" stroke-width="1" opacity="0.4"/>
    <path d="M65 49 L68 45 L71 49" fill="none" stroke="${INK.light}" stroke-width="1" opacity="0.3"/>
    <path d="M42 30 L38 28 Q42 35 42 30Z" fill="${INK.light}" opacity="0.3"/>`,

    // S03 白袍军 — 白色旗帜
    S03: `
    <line x1="35" y1="12" x2="35" y2="105" stroke="${INK.dark}" stroke-width="3"/>
    <path d="M37 12 L95 22 L90 55 L37 48Z" fill="${INK.white}" stroke="${INK.dark}" stroke-width="1.5" opacity="0.85"/>
    <path d="M50 25 L80 30" fill="none" stroke="${INK.light}" stroke-width="0.8" opacity="0.4"/>
    <path d="M50 35 L75 38" fill="none" stroke="${INK.pale}" stroke-width="0.8" opacity="0.3"/>
    <path d="M50 42 L70 44" fill="none" stroke="${INK.faint}" stroke-width="0.8" opacity="0.2"/>
    <path d="M33 12 L37 8 L39 12" fill="${INK.mid}" opacity="0.7"/>
    <path d="M88 50 L95 48 Q97 53 92 55Z" fill="${INK.light}" opacity="0.3"/>
    <path d="M35 95 L30 105 L40 105Z" fill="${INK.mid}" opacity="0.4"/>`,

    // S04 建康卫 — 城门/城楼
    S04: `
    <rect x="25" y="55" width="70" height="40" fill="${INK.wash}" stroke="${INK.dark}" stroke-width="2" opacity="0.7"/>
    <rect x="48" y="70" width="24" height="25" rx="12" fill="${INK.mid}" stroke="${INK.dark}" stroke-width="1.5" opacity="0.6"/>
    <path d="M25 55 L25 45 L35 45 L35 55 L45 55 L45 45 L55 45 L55 55 L65 55 L65 45 L75 45 L75 55 L85 55 L85 45 L95 45 L95 55"
          fill="none" stroke="${INK.dark}" stroke-width="2"/>
    <rect x="30" y="40" width="60" height="8" fill="${INK.light}" stroke="${INK.mid}" stroke-width="1" opacity="0.5"/>
    <path d="M30 40 Q60 32 90 40" fill="none" stroke="${INK.mid}" stroke-width="1.5" opacity="0.4"/>
    <line x1="60" y1="40" x2="60" y2="30" stroke="${INK.mid}" stroke-width="2" opacity="0.5"/>
    <path d="M55 30 L60 25 L65 30" fill="none" stroke="${INK.mid}" stroke-width="1.5" opacity="0.5"/>`,

    // S05 甲骑具装 — 马+甲胄 (重装骑兵)
    S05: `
    <path d="M25 70 Q30 50 45 55 Q50 40 60 45 Q65 35 72 40 Q78 35 82 42 Q88 38 92 48 Q85 45 78 48 Q72 42 65 50 Q55 45 40 55 Q30 58 25 70Z"
          fill="${INK.mid}" stroke="${INK.dark}" stroke-width="2" opacity="0.75"/>
    <path d="M25 70 Q28 80 25 95" fill="none" stroke="${INK.dark}" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M40 65 Q38 78 35 95" fill="none" stroke="${INK.dark}" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M65 60 Q68 75 70 95" fill="none" stroke="${INK.dark}" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M82 62 Q85 78 88 95" fill="none" stroke="${INK.dark}" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M45 55 Q55 48 65 55" fill="none" stroke="${INK.light}" stroke-width="1.5" opacity="0.5"/>
    <path d="M60 45 L65 38" stroke="${INK.mid}" stroke-width="2" opacity="0.5"/>
    <circle cx="75" cy="38" r="2" fill="${INK.dark}" opacity="0.7"/>
    <path d="M28 85 L42 85" stroke="${INK.light}" stroke-width="1" opacity="0.3"/>
    <path d="M60 80 L75 80" stroke="${INK.light}" stroke-width="1" opacity="0.3"/>`,

    // S06 鲜卑轻骑 — 快马
    S06: `
    <path d="M20 65 Q28 48 42 52 Q48 38 58 42 Q62 30 68 35 Q75 28 80 35 Q88 30 92 40 Q82 38 75 42 Q68 35 58 45 Q48 42 35 55 Q25 58 20 65Z"
          fill="${INK.light}" stroke="${INK.mid}" stroke-width="2" opacity="0.7"/>
    <path d="M20 65 Q22 75 18 92" fill="none" stroke="${INK.mid}" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M35 62 Q33 78 30 92" fill="none" stroke="${INK.mid}" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M58 58 Q60 75 62 92" fill="none" stroke="${INK.mid}" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M78 58 Q80 75 82 92" fill="none" stroke="${INK.mid}" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M68 35 L72 28" stroke="${INK.mid}" stroke-width="1.5" opacity="0.6"/>
    <path d="M78 38 L85 32 Q88 38 82 40Z" fill="${INK.light}" opacity="0.5"/>
    <path d="M60 45 L65 40" stroke="${INK.light}" stroke-width="1" opacity="0.3"/>
    <path d="M15 68 Q22 62 30 66" fill="none" stroke="${INK.pale}" stroke-width="1" opacity="0.25"/>`,

    // S07 洛阳禁军 — 戟
    S07: `
    <line x1="60" y1="12" x2="60" y2="100" stroke="${INK.dark}" stroke-width="3"/>
    <path d="M60 12 L60 25 L45 18 L45 30 L60 32" fill="${INK.mid}" stroke="${INK.dark}" stroke-width="1.5" opacity="0.8"/>
    <path d="M60 12 L75 18" stroke="${INK.dark}" stroke-width="2" opacity="0.7"/>
    <path d="M60 28 L75 22 L75 35 L60 38" fill="${INK.light}" stroke="${INK.mid}" stroke-width="1" opacity="0.5"/>
    <line x1="60" y1="45" x2="60" y2="100" stroke="${INK.mid}" stroke-width="1.5"/>
    <path d="M55 95 L60 100 L65 95" fill="${INK.mid}" opacity="0.5"/>
    <path d="M50 50 Q55 48 60 50" fill="none" stroke="${INK.light}" stroke-width="1" opacity="0.3"/>`,

    // S08 楼船水师 — 大船
    S08: `
    <path d="M15 60 Q35 45 60 50 Q85 45 105 60 Q100 68 60 65 Q20 68 15 60Z"
          fill="${INK.mid}" stroke="${INK.dark}" stroke-width="2" opacity="0.8"/>
    <path d="M20 55 Q45 48 70 50 Q88 47 100 55" fill="none" stroke="${INK.light}" stroke-width="1" opacity="0.4"/>
    <rect x="35" y="35" width="50" height="22" rx="2" fill="${INK.light}" stroke="${INK.mid}" stroke-width="1.5" opacity="0.6"/>
    <path d="M35 35 L35 28 L85 28 L85 35" fill="none" stroke="${INK.mid}" stroke-width="1.5"/>
    <path d="M38 28 L60 20 L82 28" fill="none" stroke="${INK.dark}" stroke-width="1.5"/>
    <line x1="60" y1="20" x2="60" y2="35" stroke="${INK.dark}" stroke-width="2"/>
    <path d="M20 68 Q30 78 20 90" fill="none" stroke="${INK.light}" stroke-width="1.5" opacity="0.4"/>
    <path d="M50 68 Q55 80 48 90" fill="none" stroke="${INK.light}" stroke-width="1.5" opacity="0.4"/>
    <path d="M80 68 Q85 80 78 90" fill="none" stroke="${INK.light}" stroke-width="1.5" opacity="0.4"/>`,

    // S09 襄阳水军 — 小船
    S09: `
    <path d="M25 65 Q45 50 60 55 Q75 50 95 65 Q90 72 60 70 Q30 72 25 65Z"
          fill="${INK.light}" stroke="${INK.mid}" stroke-width="2" opacity="0.7"/>
    <line x1="60" y1="55" x2="60" y2="28" stroke="${INK.mid}" stroke-width="2.5"/>
    <path d="M62 28 Q78 35 80 48 L62 45Z" fill="${INK.wash}" stroke="${INK.mid}" stroke-width="1" opacity="0.5"/>
    <path d="M30 70 Q35 80 28 88" fill="none" stroke="${INK.light}" stroke-width="1.2" opacity="0.4"/>
    <path d="M60 72 Q63 82 58 90" fill="none" stroke="${INK.light}" stroke-width="1.2" opacity="0.4"/>
    <path d="M80 70 Q83 80 78 88" fill="none" stroke="${INK.light}" stroke-width="1.2" opacity="0.4"/>
    <path d="M40 58 L45 55" stroke="${INK.pale}" stroke-width="1" opacity="0.3"/>`,

    // S10 青州兵 — 混合武器
    S10: `
    <path d="M30 20 L30 55 Q30 60 35 60 L35 20Z" fill="${INK.light}" stroke="${INK.mid}" stroke-width="1.5" opacity="0.6"/>
    <path d="M30 20 L30 12 Q32 8 34 12 L35 20" fill="${INK.mid}" opacity="0.7"/>
    <line x1="50" y1="15" x2="50" y2="100" stroke="${INK.dark}" stroke-width="2.5"/>
    <path d="M50 15 L40 22 L50 25 L60 22Z" fill="${INK.mid}" stroke="${INK.dark}" stroke-width="1" opacity="0.8"/>
    <path d="M70 25 Q65 30 68 40 Q72 30 75 25 Q72 22 70 25Z" fill="${INK.light}" stroke="${INK.mid}" stroke-width="1" opacity="0.6"/>
    <line x1="70" y1="40" x2="70" y2="80" stroke="${INK.mid}" stroke-width="1.5"/>
    <path d="M65 78 Q70 85 75 78" fill="none" stroke="${INK.mid}" stroke-width="1.5"/>
    <path d="M85 45 Q82 50 85 58 Q88 50 85 45Z" fill="${INK.wash}" stroke="${INK.pale}" stroke-width="0.8" opacity="0.35"/>`,
};

// ============================================================
// 策略卡 (Strategies)
// ============================================================

const strategyIcons = {
    // A01 杀 — 剑劈
    A01: `
    <path d="M50 12 L60 10 L70 12 L65 55 L55 55Z" fill="${INK.mid}" stroke="${INK.dark}" stroke-width="2" opacity="0.85"/>
    <path d="M50 12 L60 8 L70 12" fill="none" stroke="${INK.dark}" stroke-width="2"/>
    <path d="M55 55 L55 60 L48 62 L60 65 L72 62 L65 60 L65 55" fill="${INK.light}" stroke="${INK.mid}" stroke-width="1"/>
    <line x1="60" y1="14" x2="60" y2="50" stroke="${INK.dark}" stroke-width="1" opacity="0.3"/>
    <path d="M58 18 L55 15" stroke="${INK.light}" stroke-width="0.8" opacity="0.3"/>
    <path d="M62 18 L65 15" stroke="${INK.light}" stroke-width="0.8" opacity="0.3"/>
    <path d="M40 75 L45 72" stroke="${INK.light}" stroke-width="1.5" opacity="0.4"/>
    <path d="M80 75 L75 72" stroke="${INK.light}" stroke-width="1.5" opacity="0.4"/>
    <path d="M50 70 L70 70" stroke="${INK.pale}" stroke-width="1" opacity="0.3" stroke-dasharray="3,3"/>`,

    // A02 破阵 — 破盾
    A02: `
    <path d="M60 15 L90 30 L90 70 Q90 95 60 105 Q30 95 30 70 L30 30Z"
          fill="${INK.wash}" stroke="${INK.dark}" stroke-width="2.5" opacity="0.7"/>
    <path d="M55 20 L50 55" stroke="${INK.mid}" stroke-width="3" opacity="0.8"/>
    <path d="M70 25 L65 60" stroke="${INK.mid}" stroke-width="2.5" opacity="0.7"/>
    <path d="M45 50 L52 48 L48 55Z" fill="${INK.mid}" opacity="0.6"/>
    <path d="M62 52 L70 50 L66 58Z" fill="${INK.mid}" opacity="0.5"/>
    <path d="M40 65 Q50 60 60 68 Q70 60 80 65" fill="none" stroke="${INK.light}" stroke-width="1.5" opacity="0.4"/>
    <path d="M35 45 L42 42" stroke="${INK.pale}" stroke-width="1" opacity="0.3"/>
    <path d="M78 42 L85 45" stroke="${INK.pale}" stroke-width="1" opacity="0.3"/>`,

    // A03 奇袭 — 闪电/箭
    A03: `
    <path d="M55 10 L40 50 L55 48 L42 95" fill="none" stroke="${INK.dark}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M65 10 L80 50 L65 48 L78 95" fill="none" stroke="${INK.mid}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/>
    <path d="M48 52 L55 48 L52 58" fill="${INK.dark}" opacity="0.6"/>
    <path d="M38 88 L42 95 L48 88" fill="${INK.dark}" opacity="0.6"/>
    <path d="M60 35 Q62 30 58 28" fill="none" stroke="${INK.light}" stroke-width="1" opacity="0.3"/>
    <circle cx="42" cy="50" r="2" fill="${INK.mid}" opacity="0.4"/>
    <circle cx="78" cy="50" r="2" fill="${INK.light}" opacity="0.3"/>`,

    // D01 守 — 盾 (防御)
    D01: `
    <path d="M60 15 L88 30 L88 65 Q88 95 60 105 Q32 95 32 65 L32 30Z"
          fill="${INK.wash}" stroke="${INK.dark}" stroke-width="2.5" opacity="0.8"/>
    <path d="M60 25 L80 36 L80 62 Q80 88 60 96 Q40 88 40 62 L40 36Z"
          fill="${INK.white}" stroke="${INK.mid}" stroke-width="1.5" opacity="0.6"/>
    <path d="M50 48 L60 38 L70 48 L60 58Z" fill="${INK.mid}" opacity="0.4"/>
    <path d="M60 58 L60 78" stroke="${INK.light}" stroke-width="1.5" opacity="0.4"/>
    <path d="M50 68 L70 68" stroke="${INK.light}" stroke-width="1.5" opacity="0.4"/>
    <path d="M52 42 L56 38" stroke="${INK.pale}" stroke-width="0.8" opacity="0.25"/>
    <path d="M68 42 L64 38" stroke="${INK.pale}" stroke-width="0.8" opacity="0.25"/>`,

    // D02 坚壁 — 城墙
    D02: `
    <rect x="20" y="45" width="80" height="45" fill="${INK.wash}" stroke="${INK.dark}" stroke-width="2.5" opacity="0.8"/>
    <path d="M20 45 L20 35 L32 35 L32 45 L44 45 L44 35 L56 35 L56 45 L68 45 L68 35 L80 35 L80 45 L92 45 L92 35 L100 35 L100 45"
          fill="none" stroke="${INK.dark}" stroke-width="2.5"/>
    <rect x="25" y="55" width="10" height="12" rx="5" fill="${INK.mid}" opacity="0.4"/>
    <rect x="45" y="55" width="10" height="12" rx="5" fill="${INK.mid}" opacity="0.4"/>
    <rect x="65" y="55" width="10" height="12" rx="5" fill="${INK.mid}" opacity="0.4"/>
    <rect x="85" y="55" width="8" height="12" rx="4" fill="${INK.mid}" opacity="0.4"/>
    <line x1="20" y1="75" x2="100" y2="75" stroke="${INK.light}" stroke-width="1" opacity="0.3"/>
    <path d="M25 82 Q40 78 55 82 Q70 78 85 82" fill="none" stroke="${INK.pale}" stroke-width="1" opacity="0.2"/>`,

    // D03 退守 — 撤退箭
    D03: `
    <line x1="90" y1="60" x2="30" y2="60" stroke="${INK.dark}" stroke-width="3"/>
    <path d="M35 50 L20 60 L35 70" fill="none" stroke="${INK.dark}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="90" y1="60" x2="100" y2="60" stroke="${INK.mid}" stroke-width="2" opacity="0.5"/>
    <path d="M88 52 L95 60 L88 68" fill="none" stroke="${INK.mid}" stroke-width="2" opacity="0.5" stroke-linecap="round"/>
    <path d="M25 35 Q30 30 35 35 Q30 40 25 35Z" fill="${INK.light}" opacity="0.4"/>
    <path d="M55 35 Q60 30 65 35 Q60 40 55 35Z" fill="${INK.pale}" opacity="0.3"/>
    <path d="M85 35 Q90 30 95 35 Q90 40 85 35Z" fill="${INK.faint}" opacity="0.2"/>
    <path d="M25 85 Q30 80 35 85 Q30 90 25 85Z" fill="${INK.light}" opacity="0.4"/>
    <path d="M55 85 Q60 80 65 85 Q60 90 55 85Z" fill="${INK.pale}" opacity="0.3"/>
    <path d="M85 85 Q90 80 95 85 Q90 90 85 85Z" fill="${INK.faint}" opacity="0.2"/>`,

    // R01 粮草 — 谷穗
    R01: `
    <line x1="60" y1="95" x2="60" y2="30" stroke="${INK.mid}" stroke-width="2.5"/>
    <path d="M58 35 Q50 28 52 20 Q58 25 58 35Z" fill="${INK.mid}" opacity="0.6"/>
    <path d="M62 35 Q70 28 68 20 Q62 25 62 35Z" fill="${INK.mid}" opacity="0.6"/>
    <path d="M57 42 Q48 38 48 30 Q55 34 57 42Z" fill="${INK.light}" opacity="0.5"/>
    <path d="M63 42 Q72 38 72 30 Q65 34 63 42Z" fill="${INK.light}" opacity="0.5"/>
    <path d="M56 50 Q46 46 45 38 Q54 42 56 50Z" fill="${INK.light}" opacity="0.4"/>
    <path d="M64 50 Q74 46 75 38 Q66 42 64 50Z" fill="${INK.light}" opacity="0.4"/>
    <path d="M55 58 Q45 55 44 48 Q53 52 55 58Z" fill="${INK.pale}" opacity="0.35"/>
    <path d="M65 58 Q75 55 76 48 Q67 52 65 58Z" fill="${INK.pale}" opacity="0.35"/>
    <path d="M55 65 Q48 62 47 56 Q54 59 55 65Z" fill="${INK.wash}" opacity="0.3"/>
    <path d="M65 65 Q72 62 73 56 Q66 59 65 65Z" fill="${INK.wash}" opacity="0.3"/>
    <path d="M56 80 Q50 78 48 75" fill="none" stroke="${INK.pale}" stroke-width="1" opacity="0.25"/>
    <path d="M64 80 Q70 78 72 75" fill="none" stroke="${INK.pale}" stroke-width="1" opacity="0.25"/>`,

    // R02 屯田 — 农具/犁
    R02: `
    <line x1="25" y1="50" x2="85" y2="70" stroke="${INK.dark}" stroke-width="3"/>
    <path d="M82 65 L95 60 L92 75 L78 72Z" fill="${INK.mid}" stroke="${INK.dark}" stroke-width="1.5" opacity="0.7"/>
    <path d="M25 50 L20 42 L32 46Z" fill="${INK.light}" stroke="${INK.mid}" stroke-width="1" opacity="0.6"/>
    <line x1="35" y1="52" x2="30" y2="62" stroke="${INK.mid}" stroke-width="2.5"/>
    <path d="M28 60 Q25 65 30 68 Q35 65 32 60Z" fill="${INK.light}" opacity="0.5"/>
    <path d="M50 58 L48 68" stroke="${INK.light}" stroke-width="1.5" opacity="0.35"/>
    <path d="M60 62 L58 72" stroke="${INK.light}" stroke-width="1.5" opacity="0.3"/>
    <path d="M70 65 L68 75" stroke="${INK.pale}" stroke-width="1.5" opacity="0.25"/>
    <path d="M15 85 Q35 80 55 85 Q75 80 95 85" fill="none" stroke="${INK.pale}" stroke-width="1" opacity="0.2"/>`,

    // E01 淝水之战 — 水+对峙
    E01: `
    <path d="M15 65 Q30 55 45 60 Q60 50 75 58 Q90 52 105 65"
          fill="none" stroke="${INK.dark}" stroke-width="2.5" opacity="0.8"/>
    <path d="M18 72 Q33 62 48 67 Q63 57 78 65 Q93 59 108 72"
          fill="none" stroke="${INK.mid}" stroke-width="2" opacity="0.5"/>
    <path d="M20 80 Q35 72 50 76 Q65 68 80 74 Q95 68 110 80"
          fill="none" stroke="${INK.light}" stroke-width="1.5" opacity="0.3"/>
    <path d="M25 30 L30 55 L22 55Z" fill="${INK.mid}" stroke="${INK.dark}" stroke-width="1" opacity="0.6"/>
    <path d="M28 25 L33 50 L25 50Z" fill="${INK.light}" stroke="${INK.mid}" stroke-width="0.8" opacity="0.4"/>
    <path d="M95 30 L90 55 L98 55Z" fill="${INK.mid}" stroke="${INK.dark}" stroke-width="1" opacity="0.6"/>
    <path d="M92 25 L87 50 L95 50Z" fill="${INK.light}" stroke="${INK.mid}" stroke-width="0.8" opacity="0.4"/>
    <path d="M15 85 Q40 80 60 85 Q80 80 105 88" fill="none" stroke="${INK.pale}" stroke-width="1" opacity="0.2"/>`,

    // E02 钟离大捷 — 胜利旗帜
    E02: `
    <line x1="35" y1="15" x2="35" y2="105" stroke="${INK.dark}" stroke-width="3"/>
    <path d="M37 15 L95 25 L88 55 L37 48Z" fill="${INK.mid}" stroke="${INK.dark}" stroke-width="1.5" opacity="0.7"/>
    <path d="M50 25 L82 30" fill="none" stroke="${INK.light}" stroke-width="1" opacity="0.4"/>
    <path d="M50 35 L75 38" fill="none" stroke="${INK.light}" stroke-width="1" opacity="0.35"/>
    <path d="M85 50 L95 48 L95 55Z" fill="${INK.light}" opacity="0.5"/>
    <path d="M55 35 Q62 30 68 35" fill="none" stroke="${INK.white}" stroke-width="2" opacity="0.5"/>
    <path d="M58 40 Q62 36 66 40" fill="none" stroke="${INK.white}" stroke-width="1.5" opacity="0.4"/>
    <path d="M33 15 L37 10 L39 15" fill="${INK.mid}" opacity="0.6"/>
    <path d="M35 95 L30 105 L40 105Z" fill="${INK.mid}" opacity="0.4"/>`,

    // X01 晴天符 — 太阳/晴天
    X01: `
    <circle cx="60" cy="55" r="18" fill="${INK.wash}" stroke="${INK.dark}" stroke-width="2" opacity="0.7"/>
    <circle cx="60" cy="55" r="12" fill="${INK.light}" stroke="${INK.mid}" stroke-width="1" opacity="0.5"/>
    <line x1="60" y1="25" x2="60" y2="15" stroke="${INK.mid}" stroke-width="2" opacity="0.6"/>
    <line x1="60" y1="85" x2="60" y2="95" stroke="${INK.mid}" stroke-width="2" opacity="0.6"/>
    <line x1="30" y1="55" x2="20" y2="55" stroke="${INK.mid}" stroke-width="2" opacity="0.6"/>
    <line x1="90" y1="55" x2="100" y2="55" stroke="${INK.mid}" stroke-width="2" opacity="0.6"/>
    <line x1="38" y1="33" x2="31" y2="26" stroke="${INK.light}" stroke-width="1.5" opacity="0.5"/>
    <line x1="82" y1="33" x2="89" y2="26" stroke="${INK.light}" stroke-width="1.5" opacity="0.5"/>
    <line x1="38" y1="77" x2="31" y2="84" stroke="${INK.light}" stroke-width="1.5" opacity="0.5"/>
    <line x1="82" y1="77" x2="89" y2="84" stroke="${INK.light}" stroke-width="1.5" opacity="0.5"/>
    <circle cx="60" cy="55" r="5" fill="${INK.mid}" opacity="0.4"/>`,

    // X02 坚壁清野 — 扫帚/清除
    X02: `
    <line x1="45" y1="15" x2="75" y2="85" stroke="${INK.dark}" stroke-width="3"/>
    <path d="M60 55 Q55 65 50 95 Q60 88 70 95 Q65 65 60 55Z"
          fill="${INK.light}" stroke="${INK.mid}" stroke-width="1.5" opacity="0.5"/>
    <path d="M52 75 Q58 70 64 75" fill="none" stroke="${INK.light}" stroke-width="1" opacity="0.3"/>
    <path d="M50 82 Q58 77 66 82" fill="none" stroke="${INK.pale}" stroke-width="1" opacity="0.25"/>
    <path d="M48 88 Q58 83 68 88" fill="none" stroke="${INK.wash}" stroke-width="1" opacity="0.2"/>
    <path d="M80 35 L85 32 Q88 38 83 40Z" fill="${INK.pale}" opacity="0.3"/>
    <path d="M82 50 L88 48 Q90 54 85 55Z" fill="${INK.faint}" opacity="0.2"/>
    <path d="M85 65 L90 63 Q92 68 87 70Z" fill="${INK.wash}" opacity="0.15"/>
    <path d="M30 25 Q25 30 28 35 Q32 28 30 25Z" fill="${INK.light}" opacity="0.25"/>
    <path d="M35 40 Q30 45 33 50 Q37 42 35 40Z" fill="${INK.pale}" opacity="0.2"/>`,
};

// ============================================================
// 天时卡 (Weather: W01-W05)
// ============================================================

const weatherIcons = {
    // W01 暴风雪 — 雪花
    W01: `
    <line x1="60" y1="15" x2="60" y2="105" stroke="${INK.dark}" stroke-width="2" opacity="0.7"/>
    <line x1="15" y1="60" x2="105" y2="60" stroke="${INK.dark}" stroke-width="2" opacity="0.7"/>
    <line x1="25" y1="25" x2="95" y2="95" stroke="${INK.mid}" stroke-width="1.5" opacity="0.5"/>
    <line x1="95" y1="25" x2="25" y2="95" stroke="${INK.mid}" stroke-width="1.5" opacity="0.5"/>
    <path d="M60 15 L55 25 L60 22 L65 25Z" fill="${INK.dark}" opacity="0.7"/>
    <path d="M60 105 L55 95 L60 98 L65 95Z" fill="${INK.dark}" opacity="0.7"/>
    <path d="M15 60 L25 55 L22 60 L25 65Z" fill="${INK.dark}" opacity="0.7"/>
    <path d="M105 60 L95 55 L98 60 L95 65Z" fill="${INK.dark}" opacity="0.7"/>
    <path d="M25 25 L35 28 L28 32Z" fill="${INK.mid}" opacity="0.5"/>
    <path d="M95 95 L85 92 L92 88Z" fill="${INK.mid}" opacity="0.5"/>
    <path d="M95 25 L88 28 L92 35Z" fill="${INK.mid}" opacity="0.5"/>
    <path d="M25 95 L32 92 L28 85Z" fill="${INK.mid}" opacity="0.5"/>
    <circle cx="60" cy="60" r="6" fill="${INK.light}" stroke="${INK.mid}" stroke-width="1" opacity="0.5"/>
    <circle cx="45" cy="40" r="2.5" fill="${INK.pale}" opacity="0.4"/>
    <circle cx="75" cy="40" r="2" fill="${INK.pale}" opacity="0.35"/>
    <circle cx="40" cy="75" r="2" fill="${INK.pale}" opacity="0.35"/>
    <circle cx="78" cy="78" r="2.5" fill="${INK.pale}" opacity="0.4"/>`,

    // W02 梅雨连绵 — 雨滴
    W02: `
    <path d="M25 20 Q25 15 30 15 Q35 15 35 20 Q35 30 30 35 Q25 30 25 20Z"
          fill="${INK.mid}" stroke="${INK.dark}" stroke-width="1" opacity="0.7"/>
    <path d="M55 12 Q55 7 60 7 Q65 7 65 12 Q65 22 60 28 Q55 22 55 12Z"
          fill="${INK.mid}" stroke="${INK.dark}" stroke-width="1" opacity="0.7"/>
    <path d="M80 22 Q80 17 85 17 Q90 17 90 22 Q90 32 85 38 Q80 32 80 22Z"
          fill="${INK.mid}" stroke="${INK.dark}" stroke-width="1" opacity="0.7"/>
    <line x1="30" y1="38" x2="28" y2="55" stroke="${INK.light}" stroke-width="1.5" opacity="0.5"/>
    <line x1="60" y1="30" x2="58" y2="50" stroke="${INK.light}" stroke-width="1.5" opacity="0.5"/>
    <line x1="85" y1="40" x2="83" y2="58" stroke="${INK.light}" stroke-width="1.5" opacity="0.5"/>
    <path d="M20 55 Q22 52 26 55" fill="none" stroke="${INK.pale}" stroke-width="1" opacity="0.4"/>
    <path d="M50 48 Q52 45 56 48" fill="none" stroke="${INK.pale}" stroke-width="1" opacity="0.4"/>
    <path d="M75 58 Q77 55 81 58" fill="none" stroke="${INK.pale}" stroke-width="1" opacity="0.4"/>
    <path d="M30 65 L28 78" stroke="${INK.pale}" stroke-width="1" opacity="0.35"/>
    <path d="M55 60 L53 75" stroke="${INK.pale}" stroke-width="1" opacity="0.35"/>
    <path d="M80 68 L78 82" stroke="${INK.pale}" stroke-width="1" opacity="0.35"/>
    <path d="M15 85 Q30 80 45 85 Q60 80 75 85 Q90 80 105 88" fill="none" stroke="${INK.wash}" stroke-width="1.5" opacity="0.3"/>
    <path d="M15 95 Q30 90 45 95 Q60 90 75 95 Q90 90 105 98" fill="none" stroke="${INK.faint}" stroke-width="1" opacity="0.2"/>`,

    // W03 长江洪水 — 波浪
    W03: `
    <path d="M10 40 Q25 30 40 40 Q55 50 70 40 Q85 30 100 40 Q110 45 115 40"
          fill="none" stroke="${INK.dark}" stroke-width="3" opacity="0.8"/>
    <path d="M5 55 Q20 45 35 55 Q50 65 65 55 Q80 45 95 55 Q110 65 120 55"
          fill="none" stroke="${INK.mid}" stroke-width="2.5" opacity="0.6"/>
    <path d="M10 70 Q25 60 40 70 Q55 80 70 70 Q85 60 100 70 Q115 80 120 70"
          fill="none" stroke="${INK.light}" stroke-width="2" opacity="0.45"/>
    <path d="M5 85 Q20 75 35 85 Q50 95 65 85 Q80 75 95 85 Q110 95 120 85"
          fill="none" stroke="${INK.pale}" stroke-width="1.5" opacity="0.3"/>
    <path d="M15 95 Q30 88 45 95 Q60 102 75 95 Q90 88 105 95"
          fill="none" stroke="${INK.wash}" stroke-width="1" opacity="0.2"/>
    <path d="M30 38 L32 32 L35 38" fill="none" stroke="${INK.light}" stroke-width="1" opacity="0.3"/>
    <path d="M70 38 L72 32 L75 38" fill="none" stroke="${INK.light}" stroke-width="1" opacity="0.3"/>
    <path d="M50 55 L52 48 L55 55" fill="none" stroke="${INK.pale}" stroke-width="1" opacity="0.25"/>`,

    // W04 旱灾 — 太阳/干裂
    W04: `
    <circle cx="60" cy="38" r="20" fill="${INK.wash}" stroke="${INK.mid}" stroke-width="2" opacity="0.6"/>
    <circle cx="60" cy="38" r="13" fill="${INK.light}" stroke="${INK.mid}" stroke-width="1.5" opacity="0.5"/>
    <line x1="60" y1="10" x2="60" y2="5" stroke="${INK.mid}" stroke-width="2" opacity="0.5"/>
    <line x1="60" y1="66" x2="60" y2="72" stroke="${INK.mid}" stroke-width="2" opacity="0.5"/>
    <line x1="32" y1="38" x2="27" y2="38" stroke="${INK.mid}" stroke-width="2" opacity="0.5"/>
    <line x1="88" y1="38" x2="93" y2="38" stroke="${INK.mid}" stroke-width="2" opacity="0.5"/>
    <line x1="40" y1="18" x2="36" y2="14" stroke="${INK.light}" stroke-width="1.5" opacity="0.4"/>
    <line x1="80" y1="18" x2="84" y2="14" stroke="${INK.light}" stroke-width="1.5" opacity="0.4"/>
    <line x1="40" y1="58" x2="36" y2="62" stroke="${INK.light}" stroke-width="1.5" opacity="0.4"/>
    <line x1="80" y1="58" x2="84" y2="62" stroke="${INK.light}" stroke-width="1.5" opacity="0.4"/>
    <path d="M20 80 L40 75 L35 85 L55 78 L50 90 L70 82 L65 92 L85 85 L80 95 L100 88"
          fill="none" stroke="${INK.dark}" stroke-width="1.5" opacity="0.5"/>
    <path d="M30 95 L35 88 L40 95" fill="none" stroke="${INK.light}" stroke-width="1" opacity="0.3"/>
    <path d="M60 95 L65 88 L70 95" fill="none" stroke="${INK.light}" stroke-width="1" opacity="0.3"/>`,

    // W05 蝗灾 — 蝗虫
    W05: `
    <ellipse cx="55" cy="45" rx="18" ry="10" fill="${INK.mid}" stroke="${INK.dark}" stroke-width="1.5" opacity="0.7"/>
    <path d="M55 35 Q55 28 58 25 Q62 28 62 35" fill="${INK.dark}" opacity="0.8"/>
    <circle cx="53" cy="42" r="2" fill="${INK.black}" opacity="0.8"/>
    <circle cx="59" cy="42" r="2" fill="${INK.black}" opacity="0.8"/>
    <path d="M40 40 Q25 30 20 35 Q30 38 38 42" fill="${INK.light}" stroke="${INK.mid}" stroke-width="1" opacity="0.5"/>
    <path d="M40 45 Q22 42 15 48 Q28 45 38 48" fill="${INK.wash}" stroke="${INK.pale}" stroke-width="0.8" opacity="0.35"/>
    <path d="M38 50 Q20 52 12 60 Q25 55 38 55" fill="${INK.faint}" stroke="${INK.faint}" stroke-width="0.5" opacity="0.25"/>
    <line x1="45" y1="55" x2="42" y2="68" stroke="${INK.mid}" stroke-width="1.5" opacity="0.5"/>
    <line x1="50" y1="55" x2="48" y2="68" stroke="${INK.mid}" stroke-width="1.5" opacity="0.5"/>
    <line x1="55" y1="55" x2="55" y2="68" stroke="${INK.mid}" stroke-width="1.5" opacity="0.5"/>
    <line x1="60" y1="55" x2="62" y2="68" stroke="${INK.mid}" stroke-width="1.5" opacity="0.5"/>
    <path d="M42 68 Q38 72 42 75" fill="none" stroke="${INK.mid}" stroke-width="1" opacity="0.4"/>
    <path d="M48 68 Q44 72 48 75" fill="none" stroke="${INK.mid}" stroke-width="1" opacity="0.4"/>
    <path d="M55 68 Q51 72 55 75" fill="none" stroke="${INK.mid}" stroke-width="1" opacity="0.4"/>
    <path d="M62 68 Q58 72 62 75" fill="none" stroke="${INK.mid}" stroke-width="1" opacity="0.4"/>
    <path d="M80 30 Q85 25 90 28 Q85 32 80 30Z" fill="${INK.light}" opacity="0.3"/>
    <path d="M88 45 Q93 40 98 43 Q93 47 88 45Z" fill="${INK.pale}" opacity="0.25"/>
    <path d="M82 58 Q87 53 92 56 Q87 60 82 58Z" fill="${INK.faint}" opacity="0.2"/>
    <path d="M75 20 Q80 15 85 18 Q80 22 75 20Z" fill="${INK.pale}" opacity="0.2"/>`,
};

// ============================================================
// 特殊卡 (Special)
// ============================================================

const specialIcons = {
    // F01 细作 — 眼睛/暗器
    F01: `
    <path d="M20 60 Q40 30 60 30 Q80 30 100 60 Q80 90 60 90 Q40 90 20 60Z"
          fill="${INK.wash}" stroke="${INK.dark}" stroke-width="2" opacity="0.7"/>
    <circle cx="60" cy="60" r="18" fill="${INK.white}" stroke="${INK.mid}" stroke-width="1.5" opacity="0.8"/>
    <circle cx="60" cy="60" r="10" fill="${INK.dark}" opacity="0.8"/>
    <circle cx="60" cy="60" r="5" fill="${INK.black}" opacity="0.9"/>
    <circle cx="63" cy="57" r="2" fill="${INK.white}" opacity="0.6"/>
    <path d="M15 60 Q18 55 22 58" fill="none" stroke="${INK.light}" stroke-width="1" opacity="0.3"/>
    <path d="M98 58 Q102 55 105 60" fill="none" stroke="${INK.light}" stroke-width="1" opacity="0.3"/>
    <path d="M45 32 Q50 28 55 30" fill="none" stroke="${INK.pale}" stroke-width="0.8" opacity="0.25"/>
    <path d="M65 30 Q70 28 75 32" fill="none" stroke="${INK.pale}" stroke-width="0.8" opacity="0.25"/>
    <path d="M42 85 Q48 90 55 88" fill="none" stroke="${INK.pale}" stroke-width="0.8" opacity="0.25"/>
    <path d="M65 88 Q72 90 78 85" fill="none" stroke="${INK.pale}" stroke-width="0.8" opacity="0.25"/>`,
};

// ============================================================
// 合并所有图标
// ============================================================

const allIcons = {
    ...leaderIcons,
    ...generalIcons,
    ...soldierIcons,
    ...strategyIcons,
    ...weatherIcons,
    ...specialIcons,
};

// ============================================================
// 生成SVG文件
// ============================================================

// 确保输出目录存在
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

let count = 0;
let missing = [];

// 检查所有ID
const allIds = Object.keys(allIcons);
allIds.forEach(id => {
    const svg = svgWrap(allIcons[id]);
    const filePath = path.join(OUTPUT_DIR, `card_${id}.svg`);
    fs.writeFileSync(filePath, svg, 'utf-8');
    count++;
    console.log(`  生成: card_${id}.svg`);
});

console.log(`\n✅ 共生成 ${count} 个SVG图标文件到 ${OUTPUT_DIR}`);
console.log(`   领袖: ${Object.keys(leaderIcons).length}张`);
console.log(`   将领: ${Object.keys(generalIcons).length}张`);
console.log(`   士兵: ${Object.keys(soldierIcons).length}张`);
console.log(`   策略: ${Object.keys(strategyIcons).length}张`);
console.log(`   天时: ${Object.keys(weatherIcons).length}张`);
console.log(`   特殊: ${Object.keys(specialIcons).length}张`);
console.log(`   总计: ${allIds.length}张`);
