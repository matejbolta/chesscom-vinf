import {
  LAUNCH_FAILURE_TIMEOUT_MS,
  MARKERS,
  QUICK_PLAY_OWNER
} from "../shared/constants";
import type { QuickPlayButtonState, TimeControl } from "../shared/models";
import { getTimeControl } from "../shared/time-controls";
import type { NativeLaunchAdapter } from "./launch-adapter";

interface PanelRuntime {
  activeControlId: string | null;
  failureTimer: number | null;
}

const runtimes = new WeakMap<HTMLElement, PanelRuntime>();

function getButtons(panel: HTMLElement): HTMLButtonElement[] {
  return Array.from(
    panel.querySelectorAll<HTMLButtonElement>("[data-chesscom-vinf-time-control]")
  );
}

function setButtonState(
  button: HTMLButtonElement,
  state: QuickPlayButtonState,
  disabled: boolean
): void {
  button.dataset.state = state;
  button.disabled = disabled;
  button.setAttribute("aria-disabled", String(disabled));
}

function setStatus(panel: HTMLElement, message: string): void {
  const status = panel.querySelector<HTMLElement>("[data-chesscom-vinf-status]");
  if (status) {
    status.textContent = message;
  }
}

function resetAvailability(
  panel: HTMLElement,
  document: Document,
  adapter: NativeLaunchAdapter
): void {
  const runtime = runtimes.get(panel);
  if (runtime?.activeControlId) {
    return;
  }

  const available = adapter.isAvailable(document);
  panel.dataset.availability = available ? "available" : "unavailable";

  for (const button of getButtons(panel)) {
    setButtonState(button, available ? "ready" : "unavailable", !available);
  }

  setStatus(
    panel,
    available ? "" : "Quick Play is unavailable in this Chess.com build."
  );
}

function showFailure(
  panel: HTMLElement,
  button: HTMLButtonElement,
  control: TimeControl,
  document: Document,
  adapter: NativeLaunchAdapter
): void {
  const runtime = runtimes.get(panel);
  if (!runtime) {
    return;
  }

  runtime.activeControlId = null;
  runtime.failureTimer = null;
  panel.removeAttribute("aria-busy");
  resetAvailability(panel, document, adapter);

  if (!button.disabled) {
    setButtonState(button, "failed", false);
  }
  setStatus(panel, `Could not start ${control.label.replace(/^Play /, "")}. Try again.`);
}

function wirePanel(
  panel: HTMLElement,
  document: Document,
  adapter: NativeLaunchAdapter
): void {
  if (runtimes.has(panel)) {
    return;
  }

  const runtime: PanelRuntime = { activeControlId: null, failureTimer: null };
  runtimes.set(panel, runtime);

  panel.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const button = target.closest<HTMLButtonElement>(
      "button[data-chesscom-vinf-time-control]"
    );
    if (!button || !panel.contains(button) || button.disabled || runtime.activeControlId) {
      return;
    }

    const control = getTimeControl(button.dataset.chesscomVinfTimeControl ?? "");
    if (!control) {
      return;
    }

    runtime.activeControlId = control.id;
    panel.setAttribute("aria-busy", "true");
    for (const candidate of getButtons(panel)) {
      setButtonState(
        candidate,
        candidate === button ? "starting" : "ready",
        true
      );
    }
    setStatus(panel, `Starting ${control.label.replace(/^Play /, "")}…`);

    try {
      adapter.launch(document, control);
      runtime.failureTimer = window.setTimeout(() => {
        if (panel.isConnected) {
          showFailure(panel, button, control, document, adapter);
        }
      }, LAUNCH_FAILURE_TIMEOUT_MS);
    } catch {
      showFailure(panel, button, control, document, adapter);
    }
  });
}

function formatVisibleTime(control: TimeControl): string {
  const base =
    control.baseSeconds < 60
      ? `${control.baseSeconds} sec`
      : String(control.baseSeconds / 60);
  return control.incrementSeconds > 0
    ? `${base} + ${control.incrementSeconds}`
    : base;
}

function createPanel(document: Document, controls: readonly TimeControl[]): HTMLElement {
  const panel = document.createElement("section");
  panel.className = "chesscom-vinf-quick-play";
  panel.dataset.presetCount = String(controls.length);
  panel.setAttribute(MARKERS.owned, QUICK_PLAY_OWNER);
  panel.setAttribute("aria-label", "Quick Play");

  const grid = document.createElement("div");
  grid.className = "chesscom-vinf-quick-play-grid";

  for (const control of controls) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "chesscom-vinf-quick-play-button";
    button.dataset.chesscomVinfTimeControl = control.id;
    button.dataset.baseSeconds = String(control.baseSeconds);
    button.dataset.incrementSeconds = String(control.incrementSeconds);
    button.dataset.timeClass = control.timeClass;
    button.setAttribute("aria-label", control.label);

    const label = document.createElement("span");
    label.className = "chesscom-vinf-quick-play-label";
    label.textContent = formatVisibleTime(control);
    button.append(label);
    grid.append(button);
  }

  const status = document.createElement("p");
  status.className = "chesscom-vinf-quick-play-status";
  status.dataset.chesscomVinfStatus = "";
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  status.setAttribute("aria-atomic", "true");

  panel.append(grid, status);
  return panel;
}

export function ensureQuickPlayPanel(
  document: Document,
  container: HTMLElement,
  before: HTMLElement | null,
  adapter: NativeLaunchAdapter,
  controls: readonly TimeControl[]
): HTMLElement {
  let panel = document.querySelector<HTMLElement>(
    `[${MARKERS.owned}="${QUICK_PLAY_OWNER}"]`
  );

  if (panel) {
    const renderedIds = getButtons(panel).map(
      (button) => button.dataset.chesscomVinfTimeControl
    );
    const requestedIds = controls.map((control) => control.id);
    if (
      renderedIds.length !== requestedIds.length ||
      renderedIds.some((id, index) => id !== requestedIds[index])
    ) {
      destroyQuickPlayPanel(panel);
      panel = null;
    }
  }

  if (!panel) {
    panel = createPanel(document, controls);
  }

  if (
    panel.parentElement !== container ||
    (before && panel.nextElementSibling !== before)
  ) {
    container.insertBefore(panel, before);
  }

  wirePanel(panel, document, adapter);
  resetAvailability(panel, document, adapter);
  return panel;
}

export function destroyQuickPlayPanel(panel: HTMLElement): void {
  const runtime = runtimes.get(panel);
  if (runtime?.failureTimer !== null && runtime?.failureTimer !== undefined) {
    window.clearTimeout(runtime.failureTimer);
  }
  runtimes.delete(panel);
  panel.remove();
}
