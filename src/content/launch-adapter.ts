import type { TimeControl } from "../shared/models";
import { TIME_CONTROLS } from "../shared/time-controls";
import { locateHomepageModules } from "./module-locator";

const NATIVE_ACTION = "createLiveChallenge";
const NATIVE_PATH = "/play/online/new";

export class LaunchUnavailableError extends Error {
  constructor() {
    super("Chess.com's native quick-play action is unavailable.");
    this.name = "LaunchUnavailableError";
  }
}

export type Navigate = (url: string) => void;

export class NativeLaunchAdapter {
  constructor(
    private readonly navigate: Navigate = (url) => window.location.assign(url)
  ) {}

  getLaunchUrl(document: Document, control: TimeControl): URL | null {
    const template = locateHomepageModules(document).nativeLaunchTemplate;
    if (!template) {
      return null;
    }

    let url: URL;
    try {
      url = new URL(template.href);
    } catch {
      return null;
    }

    const isNativeTemplate =
      url.protocol === "https:" &&
      (url.hostname === "www.chess.com" || url.hostname === "chess.com") &&
      url.pathname === NATIVE_PATH &&
      url.searchParams.get("action") === NATIVE_ACTION &&
      url.searchParams.get("rated") === "rated" &&
      /^\d+$/.test(url.searchParams.get("base") ?? "") &&
      /^\d+$/.test(url.searchParams.get("timeIncrement") ?? "");

    if (!isNativeTemplate) {
      return null;
    }

    url.searchParams.set("base", String(control.baseSeconds));
    url.searchParams.set("timeIncrement", String(control.incrementSeconds));
    return url;
  }

  isAvailable(document: Document): boolean {
    return this.getLaunchUrl(document, TIME_CONTROLS[0]) !== null;
  }

  launch(document: Document, control: TimeControl): void {
    const url = this.getLaunchUrl(document, control);
    if (!url) {
      throw new LaunchUnavailableError();
    }

    this.navigate(url.href);
  }
}
