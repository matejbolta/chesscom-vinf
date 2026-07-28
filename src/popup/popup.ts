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
  loadSettings,
  saveSettings
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

const isSidePanelSurface =
  window.location.pathname.endsWith("/sidepanel.html");
document.documentElement.dataset.surface = isSidePanelSurface
  ? "side-panel"
  : "popup";

const form = document.querySelector<HTMLFormElement>("#settings-form")!;
const openSidePanelButton = document.querySelector<HTMLButtonElement>(
  "#open-side-panel"
)!;
const closeSidePanelButton = document.querySelector<HTMLButtonElement>(
  "#close-side-panel"
)!;
const enabledInput = document.querySelector<HTMLInputElement>("#enabled")!;
const showNativePlayPanelInput = document.querySelector<HTMLInputElement>(
  "#show-native-play-panel"
)!;
const homepageSidebarList = document.querySelector<HTMLElement>(
  "#homepage-sidebar-list"
)!;
const resetHomepageButton = document.querySelector<HTMLButtonElement>(
  "#reset-homepage"
)!;
const presetCountSelect = document.querySelector<HTMLSelectElement>(
  "#quick-play-preset-count"
)!;
const presetList = document.querySelector<HTMLElement>("#preset-list")!;
const resetButton = document.querySelector<HTMLButtonElement>("#reset-presets")!;
const resetStatsButton =
  document.querySelector<HTMLButtonElement>("#reset-stats")!;
const statsSummaryList = document.querySelector<HTMLElement>(
  "#stats-summary-list"
)!;
const statsRatingList = document.querySelector<HTMLElement>(
  "#stats-rating-list"
)!;
const status = document.querySelector<HTMLElement>("#status")!;

const selects: HTMLSelectElement[] = [];
let initialized = false;
let latestSaveId = 0;
let saveQueue: Promise<void> = Promise.resolve();
let statusTimer: number | undefined;

type SidePanelApi = {
  open?(options: { windowId: number }): Promise<void>;
  close?(options: { windowId: number }): Promise<void>;
};

const sidePanelApi = (
  chrome as typeof chrome & {
    sidePanel?: SidePanelApi;
  }
).sidePanel;
let sidePanelWindowId: number | undefined;

const canOpenSidePanel =
  !isSidePanelSurface && typeof sidePanelApi?.open === "function";
const canCloseSidePanel =
  isSidePanelSurface && typeof sidePanelApi?.close === "function";

if (
  (canOpenSidePanel || canCloseSidePanel) &&
  typeof chrome.windows?.getCurrent === "function"
) {
  void chrome.windows
    .getCurrent()
    .then((currentWindow) => {
      if (currentWindow.id === undefined) {
        return;
      }
      sidePanelWindowId = currentWindow.id;
      openSidePanelButton.hidden = !canOpenSidePanel;
      closeSidePanelButton.hidden = !canCloseSidePanel;
    })
    .catch(() => {});
}

class HomepageCardEditor {
  private order: HomepageSidebarCardId[];
  private visible: Set<HomepageSidebarCardId>;
  private dailyGamesPlacement: DailyGamesPlacement;
  private dailyGamesVisiblePlacement: DailyGamesVisiblePlacement;

  constructor(
    private readonly container: HTMLElement,
    private readonly catalog: readonly HomepageSidebarCard[],
    order: readonly HomepageSidebarCardId[],
    visible: readonly HomepageSidebarCardId[],
    dailyGamesPlacement: DailyGamesPlacement,
    dailyGamesVisiblePlacement: DailyGamesVisiblePlacement
  ) {
    this.order = [...order];
    this.visible = new Set(visible);
    this.dailyGamesPlacement = dailyGamesPlacement;
    this.dailyGamesVisiblePlacement = dailyGamesVisiblePlacement;
    this.render();
  }

  set(
    order: readonly HomepageSidebarCardId[],
    visible: readonly HomepageSidebarCardId[],
    dailyGamesPlacement: DailyGamesPlacement,
    dailyGamesVisiblePlacement: DailyGamesVisiblePlacement
  ): void {
    this.order = [...order];
    this.visible = new Set(visible);
    this.dailyGamesPlacement = dailyGamesPlacement;
    this.dailyGamesVisiblePlacement = dailyGamesVisiblePlacement;
    this.render();
  }

  getOrder(): HomepageSidebarCardId[] {
    return [...this.order];
  }

  getVisible(): HomepageSidebarCardId[] {
    return this.order.filter((id) =>
      id === "daily-games"
        ? this.dailyGamesPlacement === "sidebar"
        : this.visible.has(id)
    );
  }

  getDailyGamesPlacement(): DailyGamesPlacement {
    return this.dailyGamesPlacement;
  }

  getDailyGamesVisiblePlacement(): DailyGamesVisiblePlacement {
    return this.dailyGamesVisiblePlacement;
  }

  private move(id: HomepageSidebarCardId, offset: -1 | 1): void {
    const currentIndex = this.order.indexOf(id);
    const nextIndex = currentIndex + offset;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= this.order.length) {
      return;
    }
    [this.order[currentIndex], this.order[nextIndex]] = [
      this.order[nextIndex],
      this.order[currentIndex]
    ];
    this.render();
    if (initialized) {
      queueSave();
    }
  }

  private render(): void {
    const labels = new Map(this.catalog.map((item) => [item.id, item.label]));
    this.container.replaceChildren();

    this.order.forEach((id, index) => {
      const row = document.createElement("div");
      row.className = "homepage-card-row";

      if (id === "daily-games") {
        const checkbox = document.createElement("input");
        checkbox.id = `${this.container.id}-${id}`;
        checkbox.type = "checkbox";
        checkbox.checked = this.dailyGamesPlacement !== "hidden";
        const label = document.createElement("label");
        label.htmlFor = checkbox.id;
        label.textContent = labels.get(id) ?? id;
        const select = document.createElement("select");
        select.id = "homepage-daily-games-placement";
        select.className = "homepage-card-placement";
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
        select.value = this.dailyGamesVisiblePlacement;
        select.disabled = !checkbox.checked;
        checkbox.addEventListener("change", () => {
          this.dailyGamesPlacement = checkbox.checked
            ? this.dailyGamesVisiblePlacement
            : "hidden";
          select.disabled = !checkbox.checked;
        });
        select.addEventListener("change", () => {
          this.dailyGamesVisiblePlacement =
            select.value as DailyGamesVisiblePlacement;
          if (checkbox.checked) {
            this.dailyGamesPlacement = this.dailyGamesVisiblePlacement;
          }
        });
        row.append(checkbox, label, select);
      } else {
        const checkbox = document.createElement("input");
        const checkboxId = `${this.container.id}-${id}`;
        checkbox.id = checkboxId;
        checkbox.type = "checkbox";
        checkbox.checked = this.visible.has(id);
        const label = document.createElement("label");
        label.htmlFor = checkboxId;
        label.textContent = labels.get(id) ?? id;
        checkbox.addEventListener("change", () => {
          if (checkbox.checked) {
            this.visible.add(id);
          } else {
            this.visible.delete(id);
          }
        });
        row.append(checkbox, label, document.createElement("span"));
      }

      const moveUp = document.createElement("button");
      moveUp.type = "button";
      moveUp.className = "order-button";
      moveUp.textContent = "↑";
      moveUp.disabled = index === 0;
      moveUp.setAttribute(
        "aria-label",
        `Move ${labels.get(id) ?? id} up`
      );
      moveUp.addEventListener("click", () => this.move(id, -1));

      const moveDown = document.createElement("button");
      moveDown.type = "button";
      moveDown.className = "order-button";
      moveDown.textContent = "↓";
      moveDown.disabled = index === this.order.length - 1;
      moveDown.setAttribute(
        "aria-label",
        `Move ${labels.get(id) ?? id} down`
      );
      moveDown.addEventListener("click", () => this.move(id, 1));

      row.append(moveUp, moveDown);
      this.container.append(row);
    });
  }
}

class StatsPreferenceEditor<TId extends string> {
  private order: TId[];
  private visible: Set<TId>;
  private states: Map<TId, StatsDefaultState> | null;

  constructor(
    private readonly container: HTMLElement,
    private readonly catalog: readonly StatsPreference<TId>[],
    order: readonly TId[],
    visible: readonly TId[],
    states?: Readonly<Partial<Record<TId, StatsDefaultState>>>
  ) {
    this.order = [...order];
    this.visible = new Set(visible);
    this.states = states
      ? new Map(
          catalog.map(({ id }) => [id, states[id] ?? "retracted"] as const)
        )
      : null;
    this.render();
  }

  set(
    order: readonly TId[],
    visible: readonly TId[],
    states?: Readonly<Partial<Record<TId, StatsDefaultState>>>
  ): void {
    this.order = [...order];
    this.visible = new Set(visible);
    if (this.states) {
      this.states = new Map(
        this.catalog.map(
          ({ id }) =>
            [id, states?.[id] ?? this.states?.get(id) ?? "retracted"] as const
        )
      );
    }
    this.render();
  }

  getOrder(): TId[] {
    return [...this.order];
  }

  getVisible(): TId[] {
    return this.order.filter((id) => this.visible.has(id));
  }

  getStates(): Record<TId, StatsDefaultState> {
    const result = {} as Record<TId, StatsDefaultState>;
    for (const { id } of this.catalog) {
      result[id] = this.states?.get(id) ?? "retracted";
    }
    return result;
  }

  private move(id: TId, offset: -1 | 1): void {
    const currentIndex = this.order.indexOf(id);
    const nextIndex = currentIndex + offset;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= this.order.length) {
      return;
    }
    [this.order[currentIndex], this.order[nextIndex]] = [
      this.order[nextIndex],
      this.order[currentIndex]
    ];
    this.render();
    if (initialized) {
      queueSave();
    }
  }

  private render(): void {
    const labels = new Map(this.catalog.map((item) => [item.id, item.label]));
    this.container.replaceChildren();

    this.order.forEach((id, index) => {
      const row = document.createElement("div");
      row.className = "stats-preference-row";
      if (this.states) {
        row.classList.add("stats-preference-row--with-state");
      }

      const checkbox = document.createElement("input");
      const checkboxId = `${this.container.id}-${id}`;
      checkbox.id = checkboxId;
      checkbox.type = "checkbox";
      checkbox.checked = this.visible.has(id);

      const label = document.createElement("label");
      label.htmlFor = checkboxId;
      label.textContent = labels.get(id) ?? id;

      let stateSelect: HTMLSelectElement | undefined;
      if (this.states) {
        stateSelect = document.createElement("select");
        stateSelect.className = "stats-rating-state";
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
        stateSelect.value = this.states.get(id) ?? "retracted";
        stateSelect.disabled = !checkbox.checked;
        stateSelect.addEventListener("change", () => {
          this.states?.set(id, stateSelect!.value as StatsDefaultState);
        });
      }

      checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
          this.visible.add(id);
        } else {
          this.visible.delete(id);
        }
        if (stateSelect) {
          stateSelect.disabled = !checkbox.checked;
        }
      });

      const moveUp = document.createElement("button");
      moveUp.type = "button";
      moveUp.className = "order-button";
      moveUp.textContent = "↑";
      moveUp.disabled = index === 0;
      moveUp.setAttribute("aria-label", `Move ${label.textContent} up`);
      moveUp.addEventListener("click", () => this.move(id, -1));

      const moveDown = document.createElement("button");
      moveDown.type = "button";
      moveDown.className = "order-button";
      moveDown.textContent = "↓";
      moveDown.disabled = index === this.order.length - 1;
      moveDown.setAttribute("aria-label", `Move ${label.textContent} down`);
      moveDown.addEventListener("click", () => this.move(id, 1));

      if (stateSelect) {
        row.append(checkbox, label, stateSelect, moveUp, moveDown);
      } else {
        row.append(checkbox, label, moveUp, moveDown);
      }
      this.container.append(row);
    });
  }
}

const homepageCardEditor = new HomepageCardEditor(
  homepageSidebarList,
  HOMEPAGE_SIDEBAR_CARD_CATALOG,
  DEFAULT_SETTINGS.homepageSidebarOrder,
  DEFAULT_SETTINGS.homepageSidebarVisible,
  DEFAULT_SETTINGS.dailyGamesPlacement,
  DEFAULT_SETTINGS.dailyGamesVisiblePlacement
);
const statsSummaryEditor = new StatsPreferenceEditor<StatsSummaryId>(
  statsSummaryList,
  STATS_SUMMARY_CATALOG,
  DEFAULT_SETTINGS.statsSummaryOrder,
  DEFAULT_SETTINGS.statsSummaryVisible
);
const statsRatingEditor = new StatsPreferenceEditor<StatsRatingId>(
  statsRatingList,
  STATS_RATING_CATALOG,
  DEFAULT_SETTINGS.statsRatingOrder,
  DEFAULT_SETTINGS.statsRatingVisible,
  DEFAULT_SETTINGS.statsRatingStates
);

function optionLabel(label: string): string {
  return label.replace(/^Play /, "");
}

function createPresetSelect(index: number): HTMLSelectElement {
  const label = document.createElement("label");
  label.className = "preset-field";
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

  label.append(caption, select);
  presetList.append(label);
  selects.push(select);
  return select;
}

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
    const select = createPresetSelect(index);
    select.value = ids[index] ?? "";
  }
  updateOptionAvailability();
}

function renderSettings(settings: ExtensionSettings): void {
  enabledInput.checked = settings.enabled;
  showNativePlayPanelInput.checked = settings.showNativePlayPanel;
  homepageCardEditor.set(
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
  statsSummaryEditor.set(
    settings.statsSummaryOrder,
    settings.statsSummaryVisible
  );
  statsRatingEditor.set(
    settings.statsRatingOrder,
    settings.statsRatingVisible,
    settings.statsRatingStates
  );
  updateOptionAvailability();
}

function showStatus(message: string, isError = false): void {
  window.clearTimeout(statusTimer);
  status.textContent = message;
  status.classList.toggle("error", isError);
  if (message && !isError) {
    statusTimer = window.setTimeout(() => {
      status.textContent = "";
    }, 1400);
  }
}

openSidePanelButton.addEventListener("click", () => {
  if (!sidePanelApi?.open || sidePanelWindowId === undefined) {
    showStatus("Side panel is not available in this browser.", true);
    return;
  }

  openSidePanelButton.disabled = true;
  void sidePanelApi.open({ windowId: sidePanelWindowId }).then(
    () => {
      window.close();
    },
    () => {
      openSidePanelButton.disabled = false;
      showStatus("Side panel is not available in this browser.", true);
    }
  );
});

closeSidePanelButton.addEventListener("click", () => {
  if (!sidePanelApi?.close || sidePanelWindowId === undefined) {
    showStatus("Close this panel from the browser toolbar.", true);
    return;
  }

  closeSidePanelButton.disabled = true;
  void sidePanelApi.close({ windowId: sidePanelWindowId }).catch(() => {
    closeSidePanelButton.disabled = false;
    showStatus("Close this panel from the browser toolbar.", true);
  });
});

function updateOptionAvailability(): void {
  const selectedIds = selects.map((select) => select.value);
  for (const select of selects) {
    for (const option of Array.from(select.options)) {
      option.disabled =
        option.value !== select.value && selectedIds.includes(option.value);
    }
  }
}

function readSettings(): ExtensionSettings | null {
  const timeControlIds = selects.map((select) => select.value as TimeControlId);
  if (new Set(timeControlIds).size !== selects.length) {
    showStatus(`Choose ${selects.length} unique time controls.`, true);
    return null;
  }

  return {
    enabled: enabledInput.checked,
    showNativePlayPanel: showNativePlayPanelInput.checked,
    dailyGamesPlacement: homepageCardEditor.getDailyGamesPlacement(),
    dailyGamesVisiblePlacement:
      homepageCardEditor.getDailyGamesVisiblePlacement(),
    homepageSidebarOrder: homepageCardEditor.getOrder(),
    homepageSidebarVisible: homepageCardEditor.getVisible(),
    quickPlayPresetCount: getPresetCount(),
    timeControlIds,
    statsSummaryOrder: statsSummaryEditor.getOrder(),
    statsSummaryVisible: statsSummaryEditor.getVisible(),
    statsRatingOrder: statsRatingEditor.getOrder(),
    statsRatingVisible: statsRatingEditor.getVisible(),
    statsRatingStates: statsRatingEditor.getStates()
  };
}

function queueSave(successMessage = "Settings saved."): void {
  const settings = readSettings();
  if (!settings) {
    return;
  }

  const saveId = ++latestSaveId;
  showStatus("Saving…");
  const operation = saveQueue.then(() => saveSettings(settings));
  saveQueue = operation.catch(() => {});

  void operation.then(
    () => {
      if (saveId === latestSaveId) {
        showStatus(successMessage);
      }
    },
    () => {
      if (saveId === latestSaveId) {
        showStatus("Could not save settings. Try again.", true);
      }
    }
  );
}

renderPresetSelects(
  DEFAULT_SETTINGS.quickPlayPresetCount,
  DEFAULT_SETTINGS.timeControlIds
);

form.addEventListener("submit", (event) => {
  event.preventDefault();
});

form.addEventListener("change", () => {
  if (!initialized) {
    return;
  }
  updateOptionAvailability();
  queueSave();
});

presetCountSelect.addEventListener("change", () => {
  const count = getPresetCount();
  renderPresetSelects(count, getDefaultTimeControlIds(count));
});

resetButton.addEventListener("click", () => {
  getDefaultTimeControlIds(getPresetCount()).forEach((id, index) => {
    selects[index].value = id;
  });
  updateOptionAvailability();
  if (initialized) {
    queueSave("Defaults restored.");
  }
});

resetHomepageButton.addEventListener("click", () => {
  showNativePlayPanelInput.checked = DEFAULT_SETTINGS.showNativePlayPanel;
  homepageCardEditor.set(
    DEFAULT_SETTINGS.homepageSidebarOrder,
    DEFAULT_SETTINGS.homepageSidebarVisible,
    DEFAULT_SETTINGS.dailyGamesPlacement,
    DEFAULT_SETTINGS.dailyGamesVisiblePlacement
  );
  if (initialized) {
    queueSave("Homepage defaults restored.");
  }
});

resetStatsButton.addEventListener("click", () => {
  statsSummaryEditor.set(
    DEFAULT_SETTINGS.statsSummaryOrder,
    DEFAULT_SETTINGS.statsSummaryVisible
  );
  statsRatingEditor.set(
    DEFAULT_SETTINGS.statsRatingOrder,
    DEFAULT_SETTINGS.statsRatingVisible,
    DEFAULT_SETTINGS.statsRatingStates
  );
  if (initialized) {
    queueSave("Stats defaults restored.");
  }
});

void loadSettings().then((settings) => {
  renderSettings(settings);
  initialized = true;
});
