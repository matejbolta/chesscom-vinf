import type {
  DailyGamesPlacement,
  ExtensionSettings,
  QuickPlayPresetCount,
  StatsDefaultState,
  StatsRatingId,
  StatsSummaryId,
  TimeControlId
} from "../shared/models";
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
  DEFAULT_EIGHT_TIME_CONTROL_IDS,
  DEFAULT_TIME_CONTROL_IDS,
  TIME_CONTROL_SETTINGS_GROUPS
} from "../shared/time-controls";

const form = document.querySelector<HTMLFormElement>("#settings-form")!;
const enabledInput = document.querySelector<HTMLInputElement>("#enabled")!;
const dailyGamesPlacementSelect = document.querySelector<HTMLSelectElement>(
  "#daily-games-placement"
)!;
const showChessTvInput =
  document.querySelector<HTMLInputElement>("#show-chess-tv")!;
const showLegendLeagueInput = document.querySelector<HTMLInputElement>(
  "#show-legend-league"
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
  return presetCountSelect.value === "8" ? 8 : 6;
}

function getDefaultPresetIds(
  count: QuickPlayPresetCount
): readonly TimeControlId[] {
  return count === 8
    ? DEFAULT_EIGHT_TIME_CONTROL_IDS
    : DEFAULT_TIME_CONTROL_IDS;
}

function renderPresetSelects(
  count: QuickPlayPresetCount,
  ids: readonly TimeControlId[]
): void {
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
  dailyGamesPlacementSelect.value = settings.dailyGamesPlacement;
  showChessTvInput.checked = settings.showChessTv;
  showLegendLeagueInput.checked = settings.showLegendLeague;
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
    dailyGamesPlacement:
      dailyGamesPlacementSelect.value as DailyGamesPlacement,
    showChessTv: showChessTvInput.checked,
    showLegendLeague: showLegendLeagueInput.checked,
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
  renderPresetSelects(count, getDefaultPresetIds(count));
});

resetButton.addEventListener("click", () => {
  getDefaultPresetIds(getPresetCount()).forEach((id, index) => {
    selects[index].value = id;
  });
  updateOptionAvailability();
  if (initialized) {
    queueSave("Defaults restored.");
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
