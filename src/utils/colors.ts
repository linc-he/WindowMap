// 为不同应用提供高辨识度的颜色主题，同时支持深色与浅色双模式

export interface AppColorTheme {
  accent: string;
  // 深色模式类名
  borderDark: string;
  bgDark: string;
  badgeDark: string;
  activeBorderDark: string;
  // 浅色模式类名
  borderLight: string;
  bgLight: string;
  badgeLight: string;
  activeBorderLight: string;
}

const APP_THEME_MAP: Record<string, AppColorTheme> = {
  "Google Chrome": {
    accent: "#f59e0b",
    borderDark: "border-amber-500/50",
    bgDark: "bg-amber-950/40",
    badgeDark: "bg-amber-500 text-neutral-950 font-bold",
    activeBorderDark: "border-amber-400 ring-2 ring-amber-400",
    borderLight: "border-amber-400/80",
    bgLight: "bg-amber-50/90",
    badgeLight: "bg-amber-500 text-white font-bold",
    activeBorderLight: "border-amber-600 ring-2 ring-amber-500",
  },
  "Microsoft Edge": {
    accent: "#14b8a6",
    borderDark: "border-teal-400/50",
    bgDark: "bg-teal-950/40",
    badgeDark: "bg-teal-500 text-neutral-950 font-bold",
    activeBorderDark: "border-teal-400 ring-2 ring-teal-400",
    borderLight: "border-teal-500/80",
    bgLight: "bg-teal-50/90",
    badgeLight: "bg-teal-600 text-white font-bold",
    activeBorderLight: "border-teal-600 ring-2 ring-teal-500",
  },
  Safari: {
    accent: "#0ea5e9",
    borderDark: "border-sky-400/50",
    bgDark: "bg-sky-950/40",
    badgeDark: "bg-sky-500 text-neutral-950 font-bold",
    activeBorderDark: "border-sky-400 ring-2 ring-sky-400",
    borderLight: "border-sky-400/80",
    bgLight: "bg-sky-50/90",
    badgeLight: "bg-sky-600 text-white font-bold",
    activeBorderLight: "border-sky-600 ring-2 ring-sky-500",
  },
  Code: {
    accent: "#3b82f6",
    borderDark: "border-blue-400/60",
    bgDark: "bg-blue-950/40",
    badgeDark: "bg-blue-500 text-white font-bold",
    activeBorderDark: "border-blue-400 ring-2 ring-blue-400",
    borderLight: "border-blue-400/80",
    bgLight: "bg-blue-50/90",
    badgeLight: "bg-blue-600 text-white font-bold",
    activeBorderLight: "border-blue-600 ring-2 ring-blue-500",
  },
  Cursor: {
    accent: "#06b6d4",
    borderDark: "border-cyan-400/60",
    bgDark: "bg-cyan-950/40",
    badgeDark: "bg-cyan-400 text-neutral-950 font-bold",
    activeBorderDark: "border-cyan-300 ring-2 ring-cyan-400",
    borderLight: "border-cyan-500/80",
    bgLight: "bg-cyan-50/90",
    badgeLight: "bg-cyan-600 text-white font-bold",
    activeBorderLight: "border-cyan-600 ring-2 ring-cyan-500",
  },
  Warp: {
    accent: "#a855f7",
    borderDark: "border-purple-400/60",
    bgDark: "bg-purple-950/40",
    badgeDark: "bg-purple-500 text-white font-bold",
    activeBorderDark: "border-purple-400 ring-2 ring-purple-400",
    borderLight: "border-purple-400/80",
    bgLight: "bg-purple-50/90",
    badgeLight: "bg-purple-600 text-white font-bold",
    activeBorderLight: "border-purple-600 ring-2 ring-purple-500",
  },
  Termora: {
    accent: "#10b981",
    borderDark: "border-emerald-400/60",
    bgDark: "bg-emerald-950/40",
    badgeDark: "bg-emerald-500 text-neutral-950 font-bold",
    activeBorderDark: "border-emerald-400 ring-2 ring-emerald-400",
    borderLight: "border-emerald-500/80",
    bgLight: "bg-emerald-50/90",
    badgeLight: "bg-emerald-600 text-white font-bold",
    activeBorderLight: "border-emerald-600 ring-2 ring-emerald-500",
  },
  Terminal: {
    accent: "#10b981",
    borderDark: "border-emerald-500/50",
    bgDark: "bg-emerald-950/40",
    badgeDark: "bg-emerald-500 text-neutral-950 font-bold",
    activeBorderDark: "border-emerald-400 ring-2 ring-emerald-400",
    borderLight: "border-emerald-500/80",
    bgLight: "bg-emerald-50/90",
    badgeLight: "bg-emerald-600 text-white font-bold",
    activeBorderLight: "border-emerald-600 ring-2 ring-emerald-500",
  },
  微信: {
    accent: "#22c55e",
    borderDark: "border-green-400/60",
    bgDark: "bg-green-950/40",
    badgeDark: "bg-green-500 text-neutral-950 font-bold",
    activeBorderDark: "border-green-400 ring-2 ring-green-400",
    borderLight: "border-green-500/80",
    bgLight: "bg-green-50/90",
    badgeLight: "bg-green-600 text-white font-bold",
    activeBorderLight: "border-green-600 ring-2 ring-green-500",
  },
  飞书: {
    accent: "#38bdf8",
    borderDark: "border-sky-400/60",
    bgDark: "bg-sky-950/40",
    badgeDark: "bg-sky-500 text-white font-bold",
    activeBorderDark: "border-sky-400 ring-2 ring-sky-400",
    borderLight: "border-sky-400/80",
    bgLight: "bg-sky-50/90",
    badgeLight: "bg-sky-600 text-white font-bold",
    activeBorderLight: "border-sky-600 ring-2 ring-sky-500",
  },
  "Microsoft Teams": {
    accent: "#6366f1",
    borderDark: "border-indigo-400/60",
    bgDark: "bg-indigo-950/40",
    badgeDark: "bg-indigo-500 text-white font-bold",
    activeBorderDark: "border-indigo-400 ring-2 ring-indigo-400",
    borderLight: "border-indigo-400/80",
    bgLight: "bg-indigo-50/90",
    badgeLight: "bg-indigo-600 text-white font-bold",
    activeBorderLight: "border-indigo-600 ring-2 ring-indigo-500",
  },
  Antigravity: {
    accent: "#d946ef",
    borderDark: "border-fuchsia-400/60",
    bgDark: "bg-fuchsia-950/40",
    badgeDark: "bg-fuchsia-500 text-white font-bold",
    activeBorderDark: "border-fuchsia-400 ring-2 ring-fuchsia-400",
    borderLight: "border-fuchsia-400/80",
    bgLight: "bg-fuchsia-50/90",
    badgeLight: "bg-fuchsia-600 text-white font-bold",
    activeBorderLight: "border-fuchsia-600 ring-2 ring-fuchsia-500",
  },
  ChatGPT: {
    accent: "#10b981",
    borderDark: "border-emerald-400/60",
    bgDark: "bg-emerald-950/40",
    badgeDark: "bg-emerald-500 text-neutral-950 font-bold",
    activeBorderDark: "border-emerald-400 ring-2 ring-emerald-400",
    borderLight: "border-emerald-500/80",
    bgLight: "bg-emerald-50/90",
    badgeLight: "bg-emerald-600 text-white font-bold",
    activeBorderLight: "border-emerald-600 ring-2 ring-emerald-500",
  },
  波点音乐: {
    accent: "#f43f5e",
    borderDark: "border-rose-400/60",
    bgDark: "bg-rose-950/40",
    badgeDark: "bg-rose-500 text-white font-bold",
    activeBorderDark: "border-rose-400 ring-2 ring-rose-400",
    borderLight: "border-rose-400/80",
    bgLight: "bg-rose-50/90",
    badgeLight: "bg-rose-600 text-white font-bold",
    activeBorderLight: "border-rose-600 ring-2 ring-rose-500",
  },
  FlClash: {
    accent: "#f97316",
    borderDark: "border-orange-400/60",
    bgDark: "bg-orange-950/40",
    badgeDark: "bg-orange-500 text-neutral-950 font-bold",
    activeBorderDark: "border-orange-400 ring-2 ring-orange-400",
    borderLight: "border-orange-400/80",
    bgLight: "bg-orange-50/90",
    badgeLight: "bg-orange-600 text-white font-bold",
    activeBorderLight: "border-orange-600 ring-2 ring-orange-500",
  },
};

const PALETTE: AppColorTheme[] = [
  {
    accent: "#0ea5e9",
    borderDark: "border-sky-400/50",
    bgDark: "bg-sky-950/40",
    badgeDark: "bg-sky-500 text-neutral-950 font-bold",
    activeBorderDark: "border-sky-400 ring-2 ring-sky-400",
    borderLight: "border-sky-400/80",
    bgLight: "bg-sky-50/90",
    badgeLight: "bg-sky-600 text-white font-bold",
    activeBorderLight: "border-sky-600 ring-2 ring-sky-500",
  },
  {
    accent: "#8b5cf6",
    borderDark: "border-violet-400/50",
    bgDark: "bg-violet-950/40",
    badgeDark: "bg-violet-500 text-white font-bold",
    activeBorderDark: "border-violet-400 ring-2 ring-violet-400",
    borderLight: "border-violet-400/80",
    bgLight: "bg-violet-50/90",
    badgeLight: "bg-violet-600 text-white font-bold",
    activeBorderLight: "border-violet-600 ring-2 ring-violet-500",
  },
  {
    accent: "#10b981",
    borderDark: "border-emerald-400/50",
    bgDark: "bg-emerald-950/40",
    badgeDark: "bg-emerald-500 text-neutral-950 font-bold",
    activeBorderDark: "border-emerald-400 ring-2 ring-emerald-400",
    borderLight: "border-emerald-500/80",
    bgLight: "bg-emerald-50/90",
    badgeLight: "bg-emerald-600 text-white font-bold",
    activeBorderLight: "border-emerald-600 ring-2 ring-emerald-500",
  },
  {
    accent: "#f59e0b",
    borderDark: "border-amber-400/50",
    bgDark: "bg-amber-950/40",
    badgeDark: "bg-amber-500 text-neutral-950 font-bold",
    activeBorderDark: "border-amber-400 ring-2 ring-amber-400",
    borderLight: "border-amber-400/80",
    bgLight: "bg-amber-50/90",
    badgeLight: "bg-amber-500 text-white font-bold",
    activeBorderLight: "border-amber-600 ring-2 ring-amber-500",
  },
  {
    accent: "#f43f5e",
    borderDark: "border-rose-400/50",
    bgDark: "bg-rose-950/40",
    badgeDark: "bg-rose-500 text-white font-bold",
    activeBorderDark: "border-rose-400 ring-2 ring-rose-400",
    borderLight: "border-rose-400/80",
    bgLight: "bg-rose-50/90",
    badgeLight: "bg-rose-600 text-white font-bold",
    activeBorderLight: "border-rose-600 ring-2 ring-rose-500",
  },
  {
    accent: "#06b6d4",
    borderDark: "border-cyan-400/50",
    bgDark: "bg-cyan-950/40",
    badgeDark: "bg-cyan-500 text-neutral-950 font-bold",
    activeBorderDark: "border-cyan-400 ring-2 ring-cyan-400",
    borderLight: "border-cyan-500/80",
    bgLight: "bg-cyan-50/90",
    badgeLight: "bg-cyan-600 text-white font-bold",
    activeBorderLight: "border-cyan-600 ring-2 ring-cyan-500",
  },
];

export function getAppTheme(appName: string): AppColorTheme {
  if (APP_THEME_MAP[appName]) {
    return APP_THEME_MAP[appName];
  }

  let hash = 0;
  for (let i = 0; i < appName.length; i++) {
    hash = (hash << 5) - hash + appName.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % PALETTE.length;
  return PALETTE[index];
}
