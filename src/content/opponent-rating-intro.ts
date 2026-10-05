const KEY = "chesscom-vinf-rating-intro";
const DURATION = 30_000;

/** Brief native rating introduction; no ratings or account details are persisted. */
export class OpponentRatingIntro {
  private game = "";
  private expires = 0;
  private label: HTMLElement | null = null;
  private timer: number | null = null;
  private window: Window | null = null;

  reconcile(document: Document, pathname: string): void {
    const game = pathname.match(/^(?:\/game\/(?:live\/)?|\/live\/game\/)(\d+)\/?$/)?.[1];
    if (!game) { this.cleanup(); return; }
    const top = document.querySelector<HTMLElement>("#board-layout-player-top .player-component");
    const list = document.querySelector('wc-simple-move-list[board-id="board-single"]');
    if (!top || !list) return;
    if (game !== this.game) {
      this.cleanup();
      this.game = game;
      this.expires = 0;
      try {
        const saved = JSON.parse(document.defaultView?.sessionStorage.getItem(KEY) ?? "null");
        if (saved?.game === game && Number.isFinite(saved.expires)) this.expires = saved.expires;
        else this.expires = list.querySelector('[data-node^="0-"]') ? 0 : Date.now() + DURATION;
        document.defaultView?.sessionStorage.setItem(KEY, JSON.stringify({game, expires: this.expires}));
      } catch {
        // Storage unavailable: never restart after a reload into existing moves.
        this.expires = list.querySelector('[data-node^="0-"]') ? 0 : Date.now() + DURATION;
      }
    }
    const remaining = this.expires - Date.now();
    if (remaining <= 0 || remaining > DURATION) { this.cleanup(); return; }
    const rating = (side: string) => {
      const text = document.querySelector(`#board-layout-player-${side} .cc-user-rating-white`)?.textContent ?? "";
      const match = text.trim().match(/^\(?(\d{1,4})\)?$/);
      return match ? Number(match[1]) : null;
    };
    const opponent = rating("top");
    const own = rating("bottom");
    if (opponent === null || own === null) return;
    if (!this.label?.isConnected || this.label.parentElement !== top) {
      this.label?.remove();
      this.label = document.createElement("span");
      this.label.className = "chesscom-vinf-opponent-rating-intro";
      this.label.setAttribute("data-chesscom-vinf-owned", "rating-intro");
      top.append(this.label);
    }
    const difference = opponent - own;
    const text = `${opponent} (${difference > 0 ? "+" + difference : difference < 0 ? "−" + Math.abs(difference) : "=0"})`;
    if (this.label.textContent !== text) this.label.textContent = text;
    if (this.timer === null) {
      this.window = document.defaultView;
      this.timer = this.window?.setTimeout(() => this.cleanup(), remaining) ?? null;
    }
  }

  cleanup(): void {
    this.label?.remove();
    this.label = null;
    if (this.timer !== null) this.window?.clearTimeout(this.timer);
    this.timer = null;
  }
}
