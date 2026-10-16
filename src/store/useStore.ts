import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { AppSettings, ScreenInfo, WindowInfo } from "../types";

interface State {
  screens: ScreenInfo[];
  currentScreen: ScreenInfo | null;
  windows: WindowInfo[];
  selectedIndex: number;
  isAccessibilityGranted: boolean;
  showSettings: boolean;
  isLoading: boolean;
  settings: AppSettings;

  fetchState: () => Promise<void>;
  activateSelected: () => Promise<void>;
  activateWindow: (win: WindowInfo) => Promise<void>;
  hideOverlay: () => Promise<void>;
  setSelectedIndex: (idx: number) => void;
  setShowSettings: (show: boolean) => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  checkPermission: () => Promise<void>;
  openPermissionSettings: () => Promise<void>;

  navigateDirection: (direction: "up" | "down" | "left" | "right") => void;
  navigateNext: () => void;
  navigatePrev: () => void;
}

const SETTINGS_STORAGE_KEY = "windowmap_settings";

const defaultSettings: AppSettings = {
  shortcut: "Alt+Space",
  anchor: "top-left",
  previewRatio: 0.28,
  scope: "current-screen",
  showWindowTitles: false,
};

function loadSavedSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      return { ...defaultSettings, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error("加载设置失败，使用默认配置", e);
  }
  return defaultSettings;
}

export const useStore = create<State>((set, get) => ({
  screens: [],
  currentScreen: null,
  windows: [],
  selectedIndex: 0,
  isAccessibilityGranted: true,
  showSettings: false,
  isLoading: false,
  settings: loadSavedSettings(),

  fetchState: async () => {
    try {
      set({ isLoading: true });
      const [screens, currentScreen, allWindows, isAccessibilityGranted] =
        await Promise.all([
          invoke<ScreenInfo[]>("get_screens"),
          invoke<ScreenInfo>("get_current_screen"),
          invoke<WindowInfo[]>("list_windows"),
          invoke<boolean>("get_accessibility_status"),
        ]);

      // 根据 scope 过滤窗口
      const settings = get().settings;
      let filteredWindows = allWindows;

      if (settings.scope === "current-screen" && currentScreen) {
        filteredWindows = allWindows.filter((w) => {
          // 判断窗口中心点是否落在当前屏幕范围内
          const cx = w.x + w.width / 2;
          const cy = w.y + w.height / 2;
          return (
            cx >= currentScreen.x &&
            cx < currentScreen.x + currentScreen.width &&
            cy >= currentScreen.y &&
            cy < currentScreen.y + currentScreen.height
          );
        });
      }

      set({
        screens,
        currentScreen,
        windows: filteredWindows,
        isAccessibilityGranted,
        selectedIndex: filteredWindows.length > 0 ? 0 : -1,
        isLoading: false,
      });
    } catch (e) {
      console.error("fetchState 错误:", e);
      set({ isLoading: false });
    }
  },

  activateSelected: async () => {
    const { windows, selectedIndex, activateWindow } = get();
    if (selectedIndex >= 0 && selectedIndex < windows.length) {
      await activateWindow(windows[selectedIndex]);
    }
  },

  activateWindow: async (win: WindowInfo) => {
    try {
      await invoke("activate_window", {
        pid: win.pid,
        x: win.x,
        y: win.y,
        width: win.width,
        height: win.height,
      });
    } catch (e) {
      console.error("激活窗口失败:", e);
    }
  },

  hideOverlay: async () => {
    try {
      await invoke("hide_overlay");
    } catch (e) {
      console.error("隐藏浮层失败:", e);
    }
  },

  setSelectedIndex: (idx: number) => {
    set({ selectedIndex: idx });
  },

  setShowSettings: (show: boolean) => {
    set({ showSettings: show });
  },

  updateSettings: (newSettings: Partial<AppSettings>) => {
    const updated = { ...get().settings, ...newSettings };
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    set({ settings: updated });
  },

  checkPermission: async () => {
    try {
      const isGranted = await invoke<boolean>("get_accessibility_status");
      set({ isAccessibilityGranted: isGranted });
    } catch (e) {
      console.error("检查权限出错:", e);
    }
  },

  openPermissionSettings: async () => {
    try {
      await invoke("request_accessibility_settings");
    } catch (e) {
      console.error("打开权限设置出错:", e);
    }
  },

  navigateNext: () => {
    const { windows, selectedIndex } = get();
    if (windows.length === 0) return;
    set({ selectedIndex: (selectedIndex + 1) % windows.length });
  },

  navigatePrev: () => {
    const { windows, selectedIndex } = get();
    if (windows.length === 0) return;
    set({ selectedIndex: (selectedIndex - 1 + windows.length) % windows.length });
  },

  navigateDirection: (direction: "up" | "down" | "left" | "right") => {
    const { windows, selectedIndex } = get();
    if (windows.length <= 1 || selectedIndex < 0) return;

    const current = windows[selectedIndex];
    const currentCx = current.x + current.width / 2;
    const currentCy = current.y + current.height / 2;

    let bestIdx = -1;
    let minDistance = Infinity;

    for (let i = 0; i < windows.length; i++) {
      if (i === selectedIndex) continue;
      const target = windows[i];
      const targetCx = target.x + target.width / 2;
      const targetCy = target.y + target.height / 2;

      const dx = targetCx - currentCx;
      const dy = targetCy - currentCy;

      let isValidDirection = false;
      let directionalDistance = 0;

      switch (direction) {
        case "right":
          isValidDirection = dx > 20;
          directionalDistance = dx + Math.abs(dy) * 1.8;
          break;
        case "left":
          isValidDirection = dx < -20;
          directionalDistance = -dx + Math.abs(dy) * 1.8;
          break;
        case "down":
          isValidDirection = dy > 20;
          directionalDistance = dy + Math.abs(dx) * 1.8;
          break;
        case "up":
          isValidDirection = dy < -20;
          directionalDistance = -dy + Math.abs(dx) * 1.8;
          break;
      }

      if (isValidDirection && directionalDistance < minDistance) {
        minDistance = directionalDistance;
        bestIdx = i;
      }
    }

    if (bestIdx !== -1) {
      set({ selectedIndex: bestIdx });
    }
  },
}));
