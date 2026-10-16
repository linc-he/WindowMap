// 为不同应用提供高辨识度的颜色主题，避免所有窗口都是单调的灰色

export interface AppColorTheme {
  border: string;
  bg: string;
  badge: string;
  activeBorder: string;
  accent: string;
}

const APP_THEME_MAP: Record<string, AppColorTheme> = {
  "Google Chrome": {
    border: "border-amber-400/50",
    bg: "bg-amber-950/40",
    badge: "bg-amber-500 text-neutral-950 font-bold",
    activeBorder: "border-amber-400 ring-2 ring-amber-400",
    accent: "#f59e0b",
  },
  "Microsoft Edge": {
    border: "border-teal-400/50",
    bg: "bg-teal-950/40",
    badge: "bg-teal-500 text-neutral-950 font-bold",
    activeBorder: "border-teal-400 ring-2 ring-teal-400",
    accent: "#14b8a6",
  },
  Safari: {
    border: "border-sky-400/50",
    bg: "bg-sky-950/40",
    badge: "bg-sky-500 text-neutral-950 font-bold",
    activeBorder: "border-sky-400 ring-2 ring-sky-400",
    accent: "#0ea5e9",
  },
  Code: {
    border: "border-blue-400/60",
    bg: "bg-blue-950/40",
    badge: "bg-blue-500 text-white font-bold",
    activeBorder: "border-blue-400 ring-2 ring-blue-400",
    accent: "#3b82f6",
  },
  Cursor: {
    border: "border-cyan-400/60",
    bg: "bg-cyan-950/40",
    badge: "bg-cyan-400 text-neutral-950 font-bold",
    activeBorder: "border-cyan-300 ring-2 ring-cyan-400",
    accent: "#06b6d4",
  },
  Warp: {
    border: "border-purple-400/60",
    bg: "bg-purple-950/40",
    badge: "bg-purple-500 text-white font-bold",
    activeBorder: "border-purple-400 ring-2 ring-purple-400",
    accent: "#a855f7",
  },
  Termora: {
    border: "border-emerald-400/60",
    bg: "bg-emerald-950/40",
    badge: "bg-emerald-500 text-neutral-950 font-bold",
    activeBorder: "border-emerald-400 ring-2 ring-emerald-400",
    accent: "#10b981",
  },
  Terminal: {
    border: "border-emerald-500/50",
    bg: "bg-emerald-950/40",
    badge: "bg-emerald-500 text-neutral-950 font-bold",
    activeBorder: "border-emerald-400 ring-2 ring-emerald-400",
    accent: "#10b981",
  },
  微信: {
    border: "border-green-400/60",
    bg: "bg-green-950/40",
    badge: "bg-green-500 text-neutral-950 font-bold",
    activeBorder: "border-green-400 ring-2 ring-green-400",
    accent: "#22c55e",
  },
  飞书: {
    border: "border-sky-400/60",
    bg: "bg-sky-950/40",
    badge: "bg-sky-500 text-white font-bold",
    activeBorder: "border-sky-400 ring-2 ring-sky-400",
    accent: "#38bdf8",
  },
  "Microsoft Teams": {
    border: "border-indigo-400/60",
    bg: "bg-indigo-950/40",
    badge: "bg-indigo-500 text-white font-bold",
    activeBorder: "border-indigo-400 ring-2 ring-indigo-400",
    accent: "#6366f1",
  },
  Antigravity: {
    border: "border-fuchsia-400/60",
    bg: "bg-fuchsia-950/40",
    badge: "bg-fuchsia-500 text-white font-bold",
    activeBorder: "border-fuchsia-400 ring-2 ring-fuchsia-400",
    accent: "#d946ef",
  },
  ChatGPT: {
    border: "border-emerald-400/60",
    bg: "bg-emerald-950/40",
    badge: "bg-emerald-500 text-neutral-950 font-bold",
    activeBorder: "border-emerald-400 ring-2 ring-emerald-400",
    accent: "#10b981",
  },
  波点音乐: {
    border: "border-rose-400/60",
    bg: "bg-rose-950/40",
    badge: "bg-rose-500 text-white font-bold",
    activeBorder: "border-rose-400 ring-2 ring-rose-400",
    accent: "#f43f5e",
  },
  FlClash: {
    border: "border-orange-400/60",
    bg: "bg-orange-950/40",
    badge: "bg-orange-500 text-neutral-950 font-bold",
    activeBorder: "border-orange-400 ring-2 ring-orange-400",
    accent: "#f97316",
  },
};

const PALETTE: AppColorTheme[] = [
  {
    border: "border-sky-400/50",
    bg: "bg-sky-950/40",
    badge: "bg-sky-500 text-neutral-950 font-bold",
    activeBorder: "border-sky-400 ring-2 ring-sky-400",
    accent: "#0ea5e9",
  },
  {
    border: "border-violet-400/50",
    bg: "bg-violet-950/40",
    badge: "bg-violet-500 text-white font-bold",
    activeBorder: "border-violet-400 ring-2 ring-violet-400",
    accent: "#8b5cf6",
  },
  {
    border: "border-emerald-400/50",
    bg: "bg-emerald-950/40",
    badge: "bg-emerald-500 text-neutral-950 font-bold",
    activeBorder: "border-emerald-400 ring-2 ring-emerald-400",
    accent: "#10b981",
  },
  {
    border: "border-amber-400/50",
    bg: "bg-amber-950/40",
    badge: "bg-amber-500 text-neutral-950 font-bold",
    activeBorder: "border-amber-400 ring-2 ring-amber-400",
    accent: "#f59e0b",
  },
  {
    border: "border-rose-400/50",
    bg: "bg-rose-950/40",
    badge: "bg-rose-500 text-white font-bold",
    activeBorder: "border-rose-400 ring-2 ring-rose-400",
    accent: "#f43f5e",
  },
  {
    border: "border-cyan-400/50",
    bg: "bg-cyan-950/40",
    badge: "bg-cyan-500 text-neutral-950 font-bold",
    activeBorder: "border-cyan-400 ring-2 ring-cyan-400",
    accent: "#06b6d4",
  },
];

export function getAppTheme(appName: string): AppColorTheme {
  if (APP_THEME_MAP[appName]) {
    return APP_THEME_MAP[appName];
  }

  // 针对未知应用，根据名称哈希确定唯一色调
  let hash = 0;
  for (let i = 0; i < appName.length; i++) {
    hash = (hash << 5) - hash + appName.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % PALETTE.length;
  return PALETTE[index];
}
