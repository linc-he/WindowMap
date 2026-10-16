import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { AppSettings, ScreenInfo, WindowInfo } from "../types";

interface State {
  screens: ScreenInfo[];
  currentScreen: ScreenInfo | null;
  selectedScreenId: number | null;
  allWindows: WindowInfo[];
  windows: WindowInfo[];
  selectedIndex: number;
  isAccessibilityGranted: boolean;
  showSettings: boolean;
  isLoading: boolean;
  settings: AppSettings;

  fetchState: () => Promise<void>;
  setSelectedScreenId: (id: number) => void;
  getActiveScreen: () => ScreenInfo | null;
  activateSelected: () => Promise<void>;
  activateWindow: (win: WindowInfo) => Promise<void>;
  hideOverlay: () => Promise<void>;
  setSelectedIndex: (idx: number) => void;
  setShowSettings: (show: boolean) => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  updateGlobalShortcut: (newShortcut: string) => Promise<void>;
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
  includeStageManager: false,
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
  selectedScreenId: null,
  allWindows: [],
  windows: [],
  selectedIndex: 0,
  isAccessibilityGranted: true,
  showSettings: false,
  isLoading: false,
  settings: loadSavedSettings(),

  getActiveScreen: () => {
    const { screens, currentScreen, selectedScreenId } = get();
    if (selectedScreenId !== null) {
      const found = screens.find((s) => s.id === selectedScreenId);
      if (found) return found;
    }
    return currentScreen || screens[0] || null;
  },

  setSelectedScreenId: (id: number) => {
    set({ selectedScreenId: id });
    const { allWindows, settings } = get();
    const activeScreen = get().screens.find((s) => s.id === id);

    let filtered = allWindows;
    if (activeScreen) {
      filtered = allWindows.filter((w) => {
        // 如果开启了台前调度过滤，排除台前调度侧栏项
        if (!settings.includeStageManager && w.isStageManager) {
          return false;
        }
        if (w.screenId > 0) {
          return w.screenId === activeScreen.id;
        }
        // 坐标兜底
        const cx = w.x + w.width / 2;
        const cy = w.y + w.height / 2;
        return (
          cx >= activeScreen.x &&
          cx < activeScreen.x + activeScreen.width &&
          cy >= activeScreen.y &&
          cy < activeScreen.y + activeScreen.height
        );
      });
    }

    set({
      windows: filtered,
      selectedIndex: filtered.length > 0 ? 0 : -1,
    });
  },

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

      const state = get();
      // 保持用户主动选中的屏幕或默认当前鼠标屏幕
      const activeScreen =
        state.selectedScreenId !== null
          ? screens.find((s) => s.id === state.selectedScreenId) || currentScreen
          : currentScreen || screens[0];

      let filteredWindows = allWindows;
      if (activeScreen) {
        filteredWindows = allWindows.filter((w) => {
          if (!state.settings.includeStageManager && w.isStageManager) {
            return false;
          }
          if (w.screenId > 0) {
            return w.screenId === activeScreen.id;
          }
          const cx = w.x + w.width / 2;
          const cy = w.y + w.height / 2;
          return (
            cx >= activeScreen.x &&
            cx < activeScreen.x + activeScreen.width &&
            cy >= activeScreen.y &&
            cy < activeScreen.y + activeScreen.height
          );
        });
      }

      set({
        screens,
        currentScreen,
        selectedScreenId: activeScreen ? activeScreen.id : null,
        allWindows,
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

    // 重新应用过滤（例如切换了 includeStageManager）
    const activeScreen = get().getActiveScreen();
    const { allWindows } = get();
    if (activeScreen) {
      const filtered = allWindows.filter((w) => {
        if (!updated.includeStageManager && w.isStageManager) {
          return false;
        }
        if (w.screenId > 0) {
          return w.screenId === activeScreen.id;
        }
        const cx = w.x + w.width / 2;
        const cy = w.y + w.height / 2;
        return (
          cx >= activeScreen.x &&
          cx < activeScreen.x + activeScreen.width &&
          cy >= activeScreen.y &&
          cy < activeScreen.y + activeScreen.height
        );
      });
      set({ windows: filtered });
    }
  },

  updateGlobalShortcut: async (newShortcut: string) => {
    const oldShortcut = get().settings.shortcut;
    try {
      await invoke("update_global_shortcut", {
        oldShortcut,
        newShortcut,
      });
      get().updateSettings({ shortcut: newShortcut });
    } catch (e) {
      console.error("更新全局快捷键失败:", e);
      throw e;
    }
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
          isValidDirection = dx > 15;
          directionalDistance = dx + Math.abs(dy) * 1.6;
          break;
        case "left":
          isValidDirection = dx < -15;
          directionalDistance = -dx + Math.abs(dy) * 1.6;
          break;
        case "down":
          isValidDirection = dy > 15;
          directionalDistance = dy + Math.abs(dx) * 1.6;
          break;
        case "up":
          isValidDirection = dy < -15;
          directionalDistance = -dy + Math.abs(dx) * 1.6;
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
