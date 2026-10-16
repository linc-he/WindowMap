export interface ScreenInfo {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
  isMain: boolean;
}

export interface WindowInfo {
  windowId: number;
  pid: number;
  appName: string;
  appIcon?: string | null;
  title?: string | null;
  x: number;
  y: number;
  width: number;
  height: number;
  layer: number;
  isOnScreen: boolean;
  zOrder: number;
  isStageManager: boolean;
  screenId: number;
}

export type AnchorPosition =
  | "top-left"
  | "top-right"
  | "center"
  | "bottom-left"
  | "bottom-right";

export interface AppSettings {
  shortcut: string;
  anchor: AnchorPosition;
  previewRatio: number;
  scope: "current-screen" | "all-screens";
  showWindowTitles: boolean;
  includeStageManager: boolean;
  theme: "dark" | "light" | "system";
  closeOnActivate: boolean;
}

