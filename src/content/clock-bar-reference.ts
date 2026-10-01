/** A tab-local visual reference, never a second clock or authoritative game state. */
export class ClockBarReference {
  private game = "";
  private maxima: Record<string, number> = {};
  private storage: Storage | null = null;
  private readonly key = "chesscom-vinf-clock-reference";

  useGame(document: Document, pathname: string): void {
    const game = pathname.match(/^(?:\/game\/(?:live\/)?|\/live\/game\/)(\d+)\/?$/)?.[1] ?? pathname;
    if (game === this.game) return;
    this.game = game;
    this.maxima = {};
    try {
      this.storage = document.defaultView?.sessionStorage ?? null;
      const saved = JSON.parse(this.storage?.getItem(this.key) ?? "null");
      if (saved?.game === game) {
        for (const color of ["white", "black", "top", "bottom"]) {
          const value = saved.maxima?.[color];
          if (typeof value === "number" && Number.isFinite(value) && value >= 1 && value <= 86400) this.maxima[color] = value;
        }
      }
    } catch { this.storage = null; }
  }

  maximum(color: string, seconds: number): number {
    const previous = this.maxima[color] ?? 0;
    const maximum = Math.max(previous, seconds, 1);
    if (maximum !== previous) {
      this.maxima[color] = maximum;
      // Write only on a new maximum, not on every native clock tick. One record
      // per tab keeps no game history; blocked storage leaves a memory fallback.
      try { this.storage?.setItem(this.key, JSON.stringify({game: this.game, maxima: this.maxima})); } catch { /* memory fallback */ }
    }
    return maximum;
  }
}
