/** One entry correction for the inherited matchmaking scroll, never a scroll
 * lock. Any user input cancels it; clock ticks, moves and resize cannot rearm it. */
export class PhoneGameEntry {
  private route = '';
  private done = false;
  private cancelPending: (() => void) | null = null;

  reconcile(document: Document, route: string): void {
    if (route !== this.route) {
      this.cancelPending?.(); this.route = route; this.done = false;
    }
    if (this.done || this.cancelPending) return;
    const view = document.defaultView;
    if (!view) return;
    const cancel = () => { this.done = true; this.cancelPending?.(); };
    const inputs = ['pointerdown', 'touchstart', 'wheel', 'keydown'];
    for (const type of inputs) document.addEventListener(type, cancel, { capture: true, passive: true });
    const timer = view.setTimeout(() => {
      this.done = true;
      this.cancelPending?.();
      const player = document.querySelector('#board-layout-player-top');
      const board = document.querySelector('#board-layout-chessboard #board-single');
      if (!document.documentElement.hasAttribute('data-chesscom-vinf-phone-game') ||
          !player || !board || board.getBoundingClientRect().height <= 0) return;
      const top = player.getBoundingClientRect().top;
      const room = Math.min(48, view.innerHeight * .07);
      // Leave an already usable position alone. Correct only a clipped player
      // row/board or an entry position that pushes the board off the bottom.
      if (top < 0 || board.getBoundingClientRect().bottom > view.innerHeight - 100) {
        view.scrollTo({ top: Math.max(0, view.scrollY + top - room), behavior: 'instant' });
      }
    }, 350);
    this.cancelPending = () => {
      view.clearTimeout(timer);
      for (const type of inputs) document.removeEventListener(type, cancel, true);
      this.cancelPending = null;
    };
  }

  cleanup(): void { this.cancelPending?.(); this.done = true; }
}
