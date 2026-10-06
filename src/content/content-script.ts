import {
  loadSettings,
  saveSettings,
  normalizeSettings,
  SETTINGS_STORAGE_KEY
} from "../shared/settings";
import { startVinfRuntime, type SettingsSource } from "./runtime";

const chromeSettingsSource: SettingsSource = {
  load: () => loadSettings(window.innerWidth < 600),
  save: saveSettings,
  subscribe(listener) {
    if (typeof chrome === "undefined" || !chrome.storage?.onChanged) {
      return;
    }

    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === "local" && changes[SETTINGS_STORAGE_KEY]) {
        listener(normalizeSettings(changes[SETTINGS_STORAGE_KEY].newValue, window.innerWidth < 600));
      }
    });
  }
};

startVinfRuntime(chromeSettingsSource);
