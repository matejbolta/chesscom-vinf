import { MARKERS } from "../shared/constants";
import type {
  DailyGamesPlacement,
  DailyGamesVisiblePlacement,
  ExtensionSettings,
  HomepageSidebarCardId,
  QuickPlayPresetCount,
  StatsDefaultState,
  StatsRatingId,
  StatsSummaryId,
  TimeControlId
} from "../shared/models";
import {
  HOMEPAGE_SIDEBAR_CARD_CATALOG,
  type HomepageSidebarCard
} from "../shared/homepage-cards";
import {
  DEFAULT_SETTINGS,
  normalizeSettings,
  SETTINGS_STORAGE_KEY
} from "../shared/settings";
import {
  STATS_RATING_CATALOG,
  STATS_SUMMARY_CATALOG,
  type StatsPreference
} from "../shared/stats";
import {
  getDefaultTimeControlIds,
  getQuickPlayGridDimensions,
  isQuickPlayPresetCount,
  TIME_CONTROL_SETTINGS_GROUPS
} from "../shared/time-controls";
import { startVinfRuntime, type SettingsSource } from "../content/runtime";

declare const __VINF_USERSCRIPT_CSS__: string;

declare function GM_getValue<T>(key: string, defaultValue: T): T;
declare function GM_setValue(key: string, value: unknown): void;
declare function GM_addValueChangeListener(
  key: string,
  listener: (
    key: string,
    oldValue: unknown,
    newValue: unknown,
    remote: boolean
  ) => void
): number;
declare function GM_registerMenuCommand(
  label: string,
  listener: () => void
): string;

interface UserscriptSettingsStore extends SettingsSource {
  save(settings: ExtensionSettings): Promise<void>;
}

const localStorageKey = `chesscom-${SETTINGS_STORAGE_KEY}`;
const hasUserscriptValueApi =
  typeof GM_getValue === "function" && typeof GM_setValue === "function";

function createSettingsStore(): UserscriptSettingsStore {
  const listeners = new Set<(settings: ExtensionSettings) => void>();

  const notify = (value: unknown): void => {
    const settings = normalizeSettings(value);
    for (const listener of listeners) {
      listener(settings);
    }
  };

  if (typeof GM_addValueChangeListener === "function") {
    GM_addValueChangeListener(
      SETTINGS_STORAGE_KEY,
      (_key, _oldValue, newValue, remote) => {
        if (remote) {
          notify(newValue);
        }
      }
    );
  } else {
    window.addEventListener("storage", (event) => {
      if (event.key === localStorageKey && event.newValue) {
        try {
          notify(JSON.parse(event.newValue));
        } catch {
          notify(DEFAULT_SETTINGS);
        }
      }
    });
  }

  return {
    async load() {
      if (hasUserscriptValueApi) {
        return normalizeSettings(GM_getValue(SETTINGS_STORAGE_KEY, DEFAULT_SETTINGS));
      }
      try {
        return normalizeSettings(JSON.parse(localStorage.getItem(localStorageKey) ?? ""));
      } catch {
        return normalizeSettings(DEFAULT_SETTINGS);
      }
    },
    subscribe(listener) {
      listeners.add(listener);
    },
    async save(settings) {
      const normalized = normalizeSettings(settings);
      if (hasUserscriptValueApi) {
        GM_setValue(SETTINGS_STORAGE_KEY, normalized);
      } else {
        localStorage.setItem(localStorageKey, JSON.stringify(normalized));
      }
      notify(normalized);
    }
  };
}

function installStyles(): void {
  if (document.querySelector("[data-chesscom-vinf-userscript-styles]")) {
    return;
  }
  const style = document.createElement("style");
  style.dataset.chesscomVinfUserscriptStyles = "";
  style.textContent = __VINF_USERSCRIPT_CSS__;
  (document.head ?? document.documentElement).append(style);
}

function optionLabel(label: string): string {
  return label.replace(/^Play /, "");
}

function createSettingsDialog(store: UserscriptSettingsStore): HTMLDialogElement {
  const dialog = document.createElement("dialog");
  dialog.className = "chesscom-vinf-settings-dialog";
  dialog.dataset.chesscomVinfUserscriptSettings = "";
  dialog.setAttribute("aria-labelledby", "chesscom-vinf-settings-title");

  const form = document.createElement("form");
  form.method = "dialog";
  form.className = "chesscom-vinf-settings-form";

  const header = document.createElement("header");
  const titleWrap = document.createElement("div");
  const title = document.createElement("h2");
  title.id = "chesscom-vinf-settings-title";
  title.textContent = "ChessComVINF";
  const subtitle = document.createElement("p");
  subtitle.textContent = "Android settings";
  const close = document.createElement("button");
  close.type = "submit";
  close.value = "close";
  close.className = "chesscom-vinf-settings-close";
  close.setAttribute("aria-label", "Close VINF settings");
  close.textContent = "×";
  titleWrap.append(title, subtitle);
  header.append(titleWrap, close);

  const master = document.createElement("section");
  master.className =
    "chesscom-vinf-settings-card chesscom-vinf-settings-master-card";
  master.setAttribute("aria-label", "VINF");

  const homepage = document.createElement("section");
  homepage.className = "chesscom-vinf-settings-card";
  const homepageHeader = document.createElement("div");
  homepageHeader.className = "chesscom-vinf-settings-section-header";
  const homepageCopy = document.createElement("div");
  const homepageTitle = document.createElement("h3");
  homepageTitle.textContent = "Homepage";
  const homepageHelp = document.createElement("p");
  homepageHelp.textContent =
    "Choose the native cards that complement Quick Play.";
  const resetHomepage = document.createElement("button");
  resetHomepage.type = "button";
  resetHomepage.textContent = "Reset";
  homepageCopy.append(homepageTitle, homepageHelp);
  homepageHeader.append(homepageCopy, resetHomepage);
  homepage.append(homepageHeader);

  function createToggle(
    container: HTMLElement,
    id: string,
    labelText: string,
    description: string
  ): HTMLInputElement {
    const label = document.createElement("label");
    label.className = "chesscom-vinf-settings-row";
    const copy = document.createElement("span");
    const strong = document.createElement("strong");
    strong.textContent = labelText;
    const small = document.createElement("small");
    small.textContent = description;
    const input = document.createElement("input");
    input.id = id;
    input.type = "checkbox";
    input.setAttribute("role", "switch");
    copy.append(strong, small);
    label.append(copy, input);
    container.append(label);
    return input;
  }

  function createChoice(
    container: HTMLElement,
    id: string,
    labelText: string,
    description: string,
    ariaLabel: string,
    options: readonly (readonly [string, string])[]
  ): HTMLSelectElement {
    const label = document.createElement("label");
    label.className =
      "chesscom-vinf-settings-row chesscom-vinf-settings-row--select";
    const copy = document.createElement("span");
    const strong = document.createElement("strong");
    strong.textContent = labelText;
    const small = document.createElement("small");
    small.textContent = description;
    const select = document.createElement("select");
    select.id = id;
    select.className = "chesscom-vinf-settings-module-select";
    select.setAttribute("aria-label", ariaLabel);
    for (const [value, text] of options) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = text;
      select.append(option);
    }
    copy.append(strong, small);
    label.append(copy, select);
    container.append(label);
    return select;
  }

  const enabledInput = createToggle(
    master,
    "chesscom-vinf-userscript-enabled",
    "Enable VINF",
    "Apply homepage enhancements"
  );
  const showNativePlayPanelInput = createToggle(
    homepage,
    "chesscom-vinf-userscript-native-play-panel",
    "Native play panel",
    "Show Chess.com’s large play and recommendations panel"
  );

  const presets = document.createElement("section");
  presets.className = "chesscom-vinf-settings-card";
  const presetsHeader = document.createElement("div");
  presetsHeader.className = "chesscom-vinf-settings-section-header";
  const presetsCopy = document.createElement("div");
  const presetsTitle = document.createElement("h3");
  presetsTitle.textContent = "Quick Play presets";
  const presetsHelp = document.createElement("p");
  presetsHelp.textContent = "Choose unique time controls for the homepage.";
  const reset = document.createElement("button");
  reset.type = "button";
  reset.textContent = "Reset";
  presetsCopy.append(presetsTitle, presetsHelp);
  presetsHeader.append(presetsCopy, reset);
  presets.append(presetsHeader);

  const presetCountSelect = createChoice(
    presets,
    "chesscom-vinf-userscript-preset-count",
    "Shortcuts",
    "Choose the homepage grid size",
    "Quick Play shortcut count",
    [
      ["1", "1 button"],
      ["2", "2 buttons"],
      ["3", "3 buttons"],
      ["4", "4 buttons"],
      ["6", "6 buttons"],
      ["8", "8 buttons"]
    ]
  );

  const presetList = document.createElement("div");
  presetList.className = "chesscom-vinf-settings-presets";
  const selects: HTMLSelectElement[] = [];

  function getPresetCount(): QuickPlayPresetCount {
    const count = Number(presetCountSelect.value);
    return isQuickPlayPresetCount(count)
      ? count
      : DEFAULT_SETTINGS.quickPlayPresetCount;
  }

  function renderPresetSelects(
    count: QuickPlayPresetCount,
    ids: readonly TimeControlId[]
  ): void {
    const dimensions = getQuickPlayGridDimensions(count);
    presetList.dataset.presetColumns = String(dimensions.columns);
    presetList.dataset.presetRows = String(dimensions.rows);
    presetList.style.setProperty(
      "--chesscom-vinf-preset-columns",
      String(dimensions.columns)
    );
    presetList.style.setProperty(
      "--chesscom-vinf-preset-rows",
      String(dimensions.rows)
    );
    presetList.replaceChildren();
    selects.length = 0;
    for (let index = 0; index < count; index += 1) {
      const label = document.createElement("label");
      const caption = document.createElement("span");
      caption.textContent = `Shortcut ${index + 1}`;
      const select = document.createElement("select");
      select.setAttribute("aria-label", `Quick Play shortcut ${index + 1}`);
      for (const presetGroup of TIME_CONTROL_SETTINGS_GROUPS) {
        const group = document.createElement("optgroup");
        group.label = presetGroup.label;
        for (const control of presetGroup.controls) {
          const option = document.createElement("option");
          option.value = control.id;
          option.textContent = optionLabel(control.label);
          group.append(option);
        }
        select.append(group);
      }
      select.value = ids[index] ?? "";
      label.append(caption, select);
      presetList.append(label);
      selects.push(select);
    }
    updateOptionAvailability();
  }

  renderPresetSelects(
    DEFAULT_SETTINGS.quickPlayPresetCount,
    DEFAULT_SETTINGS.timeControlIds
  );
  presets.append(presetList);

  interface PreferenceEditor<TId extends string> {
    element: HTMLElement;
    getOrder(): TId[];
    getStates(): Record<TId, StatsDefaultState>;
    getVisible(): TId[];
    render(
      order: readonly TId[],
      visible: readonly TId[],
      states?: Readonly<Partial<Record<TId, StatsDefaultState>>>
    ): void;
  }

  function createPreferenceEditor<TId extends string>(
    titleText: string,
    catalog: readonly StatsPreference<TId>[],
    initialOrder: readonly TId[],
    initialVisible: readonly TId[],
    initialStates?: Readonly<Partial<Record<TId, StatsDefaultState>>>
  ): PreferenceEditor<TId> {
    const fieldset = document.createElement("fieldset");
    fieldset.className = "chesscom-vinf-settings-preference-group";
    const legend = document.createElement("legend");
    legend.textContent = titleText;
    const list = document.createElement("div");
    list.className = "chesscom-vinf-settings-preference-list";
    fieldset.append(legend, list);

    let order = [...initialOrder];
    let visible = new Set(initialVisible);
    let states = initialStates
      ? new Map(
          catalog.map(
            ({ id }) => [id, initialStates[id] ?? "retracted"] as const
          )
        )
      : null;
    const labels = new Map(catalog.map((item) => [item.id, item.label]));

    const render = (
      nextOrder: readonly TId[] = order,
      nextVisible: readonly TId[] = [...visible],
      nextStates?: Readonly<Partial<Record<TId, StatsDefaultState>>>
    ): void => {
      order = [...nextOrder];
      visible = new Set(nextVisible);
      if (states) {
        states = new Map(
          catalog.map(
            ({ id }) =>
              [id, nextStates?.[id] ?? states?.get(id) ?? "retracted"] as const
          )
        );
      }
      list.replaceChildren();

      order.forEach((id, index) => {
        const row = document.createElement("div");
        row.className = "chesscom-vinf-settings-preference-row";
        if (states) {
          row.classList.add(
            "chesscom-vinf-settings-preference-row--with-state"
          );
        }
        const checkbox = document.createElement("input");
        const checkboxId = `chesscom-vinf-${titleText.toLowerCase()}-${id}`;
        checkbox.id = checkboxId;
        checkbox.type = "checkbox";
        checkbox.checked = visible.has(id);
        const label = document.createElement("label");
        label.htmlFor = checkboxId;
        label.textContent = labels.get(id) ?? id;

        let stateSelect: HTMLSelectElement | undefined;
        if (states) {
          stateSelect = document.createElement("select");
          stateSelect.className = "chesscom-vinf-settings-rating-state";
          stateSelect.setAttribute(
            "aria-label",
            `${label.textContent} initial state`
          );
          for (const [value, text] of [
            ["expanded", "Expanded"],
            ["retracted", "Retracted"]
          ] as const) {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = text;
            stateSelect.append(option);
          }
          stateSelect.value = states.get(id) ?? "retracted";
          stateSelect.disabled = !checkbox.checked;
          stateSelect.addEventListener("change", () => {
            states?.set(id, stateSelect!.value as StatsDefaultState);
          });
        }

        checkbox.addEventListener("change", () => {
          if (checkbox.checked) {
            visible.add(id);
          } else {
            visible.delete(id);
          }
          if (stateSelect) {
            stateSelect.disabled = !checkbox.checked;
          }
        });

        const createMoveButton = (
          symbol: string,
          offset: -1 | 1
        ): HTMLButtonElement => {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "chesscom-vinf-settings-order-button";
          button.textContent = symbol;
          button.disabled =
            offset === -1 ? index === 0 : index === order.length - 1;
          button.setAttribute(
            "aria-label",
            `Move ${label.textContent} ${offset === -1 ? "up" : "down"}`
          );
          button.addEventListener("click", () => {
            const nextIndex = index + offset;
            if (nextIndex < 0 || nextIndex >= order.length) {
              return;
            }
            [order[index], order[nextIndex]] = [order[nextIndex], order[index]];
            render();
            void save();
          });
          return button;
        };

        if (stateSelect) {
          row.append(
            checkbox,
            label,
            stateSelect,
            createMoveButton("↑", -1),
            createMoveButton("↓", 1)
          );
        } else {
          row.append(
            checkbox,
            label,
            createMoveButton("↑", -1),
            createMoveButton("↓", 1)
          );
        }
        list.append(row);
      });
    };

    render();
    return {
      element: fieldset,
      getOrder: () => [...order],
      getStates: () => {
        const result = {} as Record<TId, StatsDefaultState>;
        for (const { id } of catalog) {
          result[id] = states?.get(id) ?? "retracted";
        }
        return result;
      },
      getVisible: () => order.filter((id) => visible.has(id)),
      render
    };
  }

  interface HomepageCardEditor {
    element: HTMLElement;
    getDailyGamesPlacement(): DailyGamesPlacement;
    getDailyGamesVisiblePlacement(): DailyGamesVisiblePlacement;
    getOrder(): HomepageSidebarCardId[];
    getVisible(): HomepageSidebarCardId[];
    render(
      order: readonly HomepageSidebarCardId[],
      visible: readonly HomepageSidebarCardId[],
      dailyGamesPlacement: DailyGamesPlacement,
      dailyGamesVisiblePlacement: DailyGamesVisiblePlacement
    ): void;
  }

  function createHomepageCardEditor(
    catalog: readonly HomepageSidebarCard[],
    initialOrder: readonly HomepageSidebarCardId[],
    initialVisible: readonly HomepageSidebarCardId[],
    initialDailyGamesPlacement: DailyGamesPlacement,
    initialDailyGamesVisiblePlacement: DailyGamesVisiblePlacement
  ): HomepageCardEditor {
    const fieldset = document.createElement("fieldset");
    fieldset.className = "chesscom-vinf-settings-preference-group";
    const legend = document.createElement("legend");
    legend.textContent = "Right column";
    const list = document.createElement("div");
    list.className = "chesscom-vinf-settings-preference-list";
    fieldset.append(legend, list);

    let order = [...initialOrder];
    let visible = new Set(initialVisible);
    let dailyGamesPlacement = initialDailyGamesPlacement;
    let dailyGamesVisiblePlacement = initialDailyGamesVisiblePlacement;
    const labels = new Map(catalog.map((item) => [item.id, item.label]));

    const render = (
      nextOrder: readonly HomepageSidebarCardId[] = order,
      nextVisible: readonly HomepageSidebarCardId[] = [...visible],
      nextDailyGamesPlacement: DailyGamesPlacement = dailyGamesPlacement,
      nextDailyGamesVisiblePlacement: DailyGamesVisiblePlacement =
        dailyGamesVisiblePlacement
    ): void => {
      order = [...nextOrder];
      visible = new Set(nextVisible);
      dailyGamesPlacement = nextDailyGamesPlacement;
      dailyGamesVisiblePlacement = nextDailyGamesVisiblePlacement;
      list.replaceChildren();

      order.forEach((id, index) => {
        const row = document.createElement("div");
        row.className =
          "chesscom-vinf-settings-preference-row chesscom-vinf-settings-homepage-card-row";
        const labelText = labels.get(id) ?? id;

        if (id === "daily-games") {
          const checkbox = document.createElement("input");
          checkbox.id = `chesscom-vinf-homepage-${id}`;
          checkbox.type = "checkbox";
          checkbox.checked = dailyGamesPlacement !== "hidden";
          const label = document.createElement("label");
          label.htmlFor = checkbox.id;
          label.textContent = labelText;
          const select = document.createElement("select");
          select.id = "chesscom-vinf-userscript-daily-placement";
          select.className = "chesscom-vinf-settings-rating-state";
          select.setAttribute("aria-label", "Daily Games placement");
          for (const [value, text] of [
            ["main", "Main"],
            ["sidebar", "Right"]
          ] as const) {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = text;
            select.append(option);
          }
          select.value = dailyGamesVisiblePlacement;
          select.disabled = !checkbox.checked;
          checkbox.addEventListener("change", () => {
            dailyGamesPlacement = checkbox.checked
              ? dailyGamesVisiblePlacement
              : "hidden";
            select.disabled = !checkbox.checked;
          });
          select.addEventListener("change", () => {
            dailyGamesVisiblePlacement =
              select.value as DailyGamesVisiblePlacement;
            if (checkbox.checked) {
              dailyGamesPlacement = dailyGamesVisiblePlacement;
            }
          });
          row.append(checkbox, label, select);
        } else {
          const checkbox = document.createElement("input");
          const checkboxId = `chesscom-vinf-homepage-${id}`;
          checkbox.id = checkboxId;
          checkbox.type = "checkbox";
          checkbox.checked = visible.has(id);
          const label = document.createElement("label");
          label.htmlFor = checkboxId;
          label.textContent = labelText;
          checkbox.addEventListener("change", () => {
            if (checkbox.checked) {
              visible.add(id);
            } else {
              visible.delete(id);
            }
          });
          row.append(checkbox, label, document.createElement("span"));
        }

        const createMoveButton = (
          symbol: string,
          offset: -1 | 1
        ): HTMLButtonElement => {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "chesscom-vinf-settings-order-button";
          button.textContent = symbol;
          button.disabled =
            offset === -1 ? index === 0 : index === order.length - 1;
          button.setAttribute(
            "aria-label",
            `Move ${labelText} ${offset === -1 ? "up" : "down"}`
          );
          button.addEventListener("click", () => {
            const nextIndex = index + offset;
            if (nextIndex < 0 || nextIndex >= order.length) {
              return;
            }
            [order[index], order[nextIndex]] = [order[nextIndex], order[index]];
            render();
            void save();
          });
          return button;
        };

        row.append(createMoveButton("↑", -1), createMoveButton("↓", 1));
        list.append(row);
      });
    };

    render();
    return {
      element: fieldset,
      getDailyGamesPlacement: () => dailyGamesPlacement,
      getDailyGamesVisiblePlacement: () => dailyGamesVisiblePlacement,
      getOrder: () => [...order],
      getVisible: () =>
        order.filter((id) =>
          id === "daily-games"
            ? dailyGamesPlacement === "sidebar"
            : visible.has(id)
        ),
      render
    };
  }

  const homepageCardEditor = createHomepageCardEditor(
    HOMEPAGE_SIDEBAR_CARD_CATALOG,
    DEFAULT_SETTINGS.homepageSidebarOrder,
    DEFAULT_SETTINGS.homepageSidebarVisible,
    DEFAULT_SETTINGS.dailyGamesPlacement,
    DEFAULT_SETTINGS.dailyGamesVisiblePlacement
  );
  const homepageNote = document.createElement("p");
  homepageNote.className = "chesscom-vinf-settings-note";
  homepageNote.textContent =
    "Unknown future Chess.com cards stay visible after these cards.";
  homepage.append(homepageCardEditor.element, homepageNote);

  const stats = document.createElement("section");
  stats.className = "chesscom-vinf-settings-card";
  const statsHeader = document.createElement("div");
  statsHeader.className = "chesscom-vinf-settings-section-header";
  const statsCopy = document.createElement("div");
  const statsTitle = document.createElement("h3");
  statsTitle.textContent = "Stats card";
  const statsHelp = document.createElement("p");
  statsHelp.textContent = "Choose visible rows and their fixed order.";
  const resetStats = document.createElement("button");
  resetStats.type = "button";
  resetStats.textContent = "Reset";
  statsCopy.append(statsTitle, statsHelp);
  statsHeader.append(statsCopy, resetStats);

  const statsSummaryEditor = createPreferenceEditor<StatsSummaryId>(
    "Summary",
    STATS_SUMMARY_CATALOG,
    DEFAULT_SETTINGS.statsSummaryOrder,
    DEFAULT_SETTINGS.statsSummaryVisible
  );
  const statsRatingEditor = createPreferenceEditor<StatsRatingId>(
    "Ratings",
    STATS_RATING_CATALOG,
    DEFAULT_SETTINGS.statsRatingOrder,
    DEFAULT_SETTINGS.statsRatingVisible,
    DEFAULT_SETTINGS.statsRatingStates
  );
  const statsNote = document.createElement("p");
  statsNote.className = "chesscom-vinf-settings-note";
  statsNote.textContent =
    "If Chess.com includes Insights here, VINF keeps it visible at the bottom.";
  stats.append(
    statsHeader,
    statsSummaryEditor.element,
    statsRatingEditor.element,
    statsNote
  );

  const status = document.createElement("p");
  status.className = "chesscom-vinf-settings-status";
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  form.append(header, master, homepage, presets, stats, status);
  dialog.append(form);

  function updateOptionAvailability(): void {
    const selected = selects.map((select) => select.value);
    for (const select of selects) {
      for (const option of Array.from(select.options)) {
        option.disabled = option.value !== select.value && selected.includes(option.value);
      }
    }
  }

  function render(settings: ExtensionSettings): void {
    enabledInput.checked = settings.enabled;
    showNativePlayPanelInput.checked = settings.showNativePlayPanel;
    homepageCardEditor.render(
      settings.homepageSidebarOrder,
      settings.homepageSidebarVisible,
      settings.dailyGamesPlacement,
      settings.dailyGamesVisiblePlacement
    );
    presetCountSelect.value = String(settings.quickPlayPresetCount);
    renderPresetSelects(
      settings.quickPlayPresetCount,
      settings.timeControlIds
    );
    statsSummaryEditor.render(
      settings.statsSummaryOrder,
      settings.statsSummaryVisible
    );
    statsRatingEditor.render(
      settings.statsRatingOrder,
      settings.statsRatingVisible,
      settings.statsRatingStates
    );
    updateOptionAvailability();
  }

  async function save(message = "Settings saved."): Promise<void> {
    const ids = selects.map((select) => select.value as TimeControlId);
    if (new Set(ids).size !== selects.length) {
      status.textContent = `Choose ${selects.length} unique time controls.`;
      status.dataset.error = "true";
      return;
    }
    status.textContent = "Saving…";
    delete status.dataset.error;
    try {
      await store.save({
        enabled: enabledInput.checked,
        showNativePlayPanel: showNativePlayPanelInput.checked,
        dailyGamesPlacement: homepageCardEditor.getDailyGamesPlacement(),
        dailyGamesVisiblePlacement:
          homepageCardEditor.getDailyGamesVisiblePlacement(),
        homepageSidebarOrder: homepageCardEditor.getOrder(),
        homepageSidebarVisible: homepageCardEditor.getVisible(),
        quickPlayPresetCount: getPresetCount(),
        timeControlIds: ids,
        statsSummaryOrder: statsSummaryEditor.getOrder(),
        statsSummaryVisible: statsSummaryEditor.getVisible(),
        statsRatingOrder: statsRatingEditor.getOrder(),
        statsRatingVisible: statsRatingEditor.getVisible(),
        statsRatingStates: statsRatingEditor.getStates()
      });
      status.textContent = message;
    } catch {
      status.textContent = "Could not save settings.";
      status.dataset.error = "true";
    }
  }

  form.addEventListener("change", () => {
    updateOptionAvailability();
    void save();
  });
  presetCountSelect.addEventListener("change", () => {
    const count = getPresetCount();
    renderPresetSelects(count, getDefaultTimeControlIds(count));
  });
  reset.addEventListener("click", () => {
    getDefaultTimeControlIds(getPresetCount()).forEach((id, index) => {
      selects[index].value = id;
    });
    updateOptionAvailability();
    void save("Defaults restored.");
  });
  resetHomepage.addEventListener("click", () => {
    showNativePlayPanelInput.checked = DEFAULT_SETTINGS.showNativePlayPanel;
    homepageCardEditor.render(
      DEFAULT_SETTINGS.homepageSidebarOrder,
      DEFAULT_SETTINGS.homepageSidebarVisible,
      DEFAULT_SETTINGS.dailyGamesPlacement,
      DEFAULT_SETTINGS.dailyGamesVisiblePlacement
    );
    void save("Homepage defaults restored.");
  });
  resetStats.addEventListener("click", () => {
    statsSummaryEditor.render(
      DEFAULT_SETTINGS.statsSummaryOrder,
      DEFAULT_SETTINGS.statsSummaryVisible
    );
    statsRatingEditor.render(
      DEFAULT_SETTINGS.statsRatingOrder,
      DEFAULT_SETTINGS.statsRatingVisible,
      DEFAULT_SETTINGS.statsRatingStates
    );
    void save("Stats defaults restored.");
  });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });
  dialog.addEventListener("close", () => dialog.remove());

  void store.load().then(render);
  document.body.append(dialog);
  return dialog;
}

const settingsStore = createSettingsStore();
installStyles();
startVinfRuntime(settingsStore);

function openSettings(): void {
  if (!document.body) {
    document.addEventListener("DOMContentLoaded", openSettings, { once: true });
    return;
  }
  const dialog =
    document.querySelector<HTMLDialogElement>("[data-chesscom-vinf-userscript-settings]") ??
    createSettingsDialog(settingsStore);
  if (!dialog.open) {
    dialog.showModal();
  }
}

if (typeof GM_registerMenuCommand === "function") {
  GM_registerMenuCommand("VINF settings", openSettings);
}

function openSettingsFromHash(): void {
  if (window.location.hash === "#vinf-settings") {
    openSettings();
  }
}

window.addEventListener("hashchange", openSettingsFromHash);
openSettingsFromHash();
