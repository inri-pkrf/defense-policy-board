// צבעי קבוצות מבוססי פלטת הלוגו
// קבוצה א' — כחול (#00668C / #00B4EF)
// קבוצה ב' — כתום (#F49833 / #FFC745)
// קבוצה ג' — ירוק (#1CB87E)
export const TEAM_COLORS = [
  {
    id: 0,
    gradient: "from-[#00668C] to-[#004a6b]",
    bgSoft: "bg-[#00668C]/20",
    border: "border-[#00B4EF]",
    borderDim: "border-[#00668C]/40",
    text: "text-[#00B4EF]",
    textLight: "text-blue-200",
    glow: "shadow-[0_0_30px_rgba(0,180,239,0.4)]",
    solid: "#00B4EF",
    solidDark: "#00668C",
    ring: "ring-[#00B4EF]",
  },
  {
    id: 1,
    gradient: "from-[#F49833] to-[#d97a1c]",
    bgSoft: "bg-[#F49833]/20",
    border: "border-[#FFC745]",
    borderDim: "border-[#F49833]/40",
    text: "text-[#FFC745]",
    textLight: "text-orange-200",
    glow: "shadow-[0_0_30px_rgba(255,199,69,0.4)]",
    solid: "#F49833",
    solidDark: "#d97a1c",
    ring: "ring-[#FFC745]",
  },
  {
    id: 2,
    gradient: "from-[#1CB87E] to-[#0d8a5c]",
    bgSoft: "bg-[#1CB87E]/20",
    border: "border-[#1CB87E]",
    borderDim: "border-[#1CB87E]/40",
    text: "text-[#3ee4a8]",
    textLight: "text-green-200",
    glow: "shadow-[0_0_30px_rgba(28,184,126,0.4)]",
    solid: "#1CB87E",
    solidDark: "#0d8a5c",
    ring: "ring-[#1CB87E]",
  },
  {
    id: 3,
    gradient: "from-[#EF626C] to-[#c43e48]",
    bgSoft: "bg-[#EF626C]/20",
    border: "border-[#EF626C]",
    borderDim: "border-[#EF626C]/40",
    text: "text-[#EF626C]",
    textLight: "text-red-200",
    glow: "shadow-[0_0_30px_rgba(239,98,108,0.4)]",
    solid: "#EF626C",
    solidDark: "#c43e48",
    ring: "ring-[#EF626C]",
  },
  {
    id: 4,
    gradient: "from-[#8b5cf6] to-[#6d28d9]",
    bgSoft: "bg-[#8b5cf6]/20",
    border: "border-[#8b5cf6]",
    borderDim: "border-[#8b5cf6]/40",
    text: "text-[#a78bfa]",
    textLight: "text-purple-200",
    glow: "shadow-[0_0_30px_rgba(139,92,246,0.4)]",
    solid: "#8b5cf6",
    solidDark: "#6d28d9",
    ring: "ring-[#8b5cf6]",
  },
  {
    id: 5,
    gradient: "from-[#14b8a6] to-[#0f766e]",
    bgSoft: "bg-[#14b8a6]/20",
    border: "border-[#14b8a6]",
    borderDim: "border-[#14b8a6]/40",
    text: "text-[#2dd4bf]",
    textLight: "text-teal-200",
    glow: "shadow-[0_0_30px_rgba(20,184,166,0.4)]",
    solid: "#14b8a6",
    solidDark: "#0f766e",
    ring: "ring-[#14b8a6]",
  },
];

// צבעי רמות הקלפים מבוססי פלטת הלוגו
export const LEVEL_COLORS = {
  100: { gradient: "from-[#1CB87E] to-[#0d8a5c]", border: "border-[#1CB87E]/50", accent: "#1CB87E" },
  200: { gradient: "from-[#00B4EF] to-[#00668C]", border: "border-[#00B4EF]/50", accent: "#00B4EF" },
  300: { gradient: "from-[#FFC745] to-[#F49833]", border: "border-[#FFC745]/50", accent: "#FFC745" },
  400: { gradient: "from-[#F49833] to-[#EF626C]", border: "border-[#F49833]/50", accent: "#F49833" },
  500: { gradient: "from-[#EF626C] to-[#c43e48]", border: "border-[#EF626C]/50", accent: "#EF626C" },
};

export const LEVELS = [100, 200, 300, 400, 500];

// כמות קלפים אפשרית — מחולקת שווה בין 5 רמות
export const CARD_COUNT_OPTIONS = [9, 12, 16, 20];

// התפלגות שאלות לפי רמות
export const CARD_DISTRIBUTION = {
  9: { levels: [100, 200, 300], perLevel: 3 },
  12: { levels: [100, 200, 300, 400], perLevel: 3 },
  16: { levels: [100, 200, 300, 400], perLevel: 4 },
  20: { levels: [100, 200, 300, 400], perLevel: 5 },
};