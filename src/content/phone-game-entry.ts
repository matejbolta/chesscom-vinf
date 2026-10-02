/** One settled entry position for pairing, reload and open-game navigation.
 * User input cancels; moves/clock ticks never rearm a completed entry. */
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
    const deadline = Date.now() + 2500;
    let previous = '';
    let stable = 0;
    let timer = 0;
    const check = () => {
      if (Date.now() >= deadline) { cancel(); return; }
      const player = document.querySelector('#board-layout-player-top');
      const board = document.querySelector('#board-layout-chessboard #board-single');
      if (document.documentElement.hasAttribute('data-chesscom-vinf-phone-game') &&
          player && board && board.getBoundingClientRect().height > 0) {
        const top = player.getBoundingClientRect().top + view.scrollY;
        const geometry = [top, board.getBoundingClientRect().height, view.innerHeight, view.scrollY]
          .map(Math.round).join(':');
        stable = geometry === previous ? stable + 1 : 0;
        previous = geometry;
        if (stable >= 2) {
          cancel();
          const room = Math.min(48, view.innerHeight * .07);
          view.scrollTo({ top: Math.max(0, top - room), behavior: 'instant' });
          return;
        }
      } else { stable = 0; previous = ''; }
      timer = view.setTimeout(check, 150);
    };
    timer = view.setTimeout(check, 350);
    this.cancelPending = () => {
      view.clearTimeout(timer);
      for (const type of inputs) document.removeEventListener(type, cancel, true);
      this.cancelPending = null;
    };
  }

  cleanup(): void { this.cancelPending?.(); this.route = ''; this.done = false; }
}
