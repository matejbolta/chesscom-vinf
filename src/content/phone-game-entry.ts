/** Bounded entry alignment for pairing, reload and open-game navigation.
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
    const deadline = Date.now() + 5000;
    let previous = '';
    let stable = 0;
    let timer = 0;
    let corrections = 0;
    const check = () => {
      if (Date.now() >= deadline) { cancel(); return; }
      const player = document.querySelector('#board-layout-player-top');
      const board = document.querySelector('#board-layout-chessboard #board-single');
      const boardRect = board?.getBoundingClientRect();
      const height = boardRect?.height ?? 0;
      if (document.documentElement.hasAttribute('data-chesscom-vinf-phone-game') &&
          player && height > 0) {
        const top = player.getBoundingClientRect().top + view.scrollY;
        const geometry = [top, height, view.innerHeight, view.scrollY]
          .map(Math.round).join(':');
        stable = geometry === previous ? stable + 1 : 0;
        previous = geometry;
        if (stable >= 2) {
          const clock = player.querySelector('.clock-component')?.getBoundingClientRect();
          // Equal space on either side of the row's center: viewport -> row -> board.
          const center = clock?.height ? clock.top + clock.height / 2 : player.getBoundingClientRect().top + 28;
          const target = Math.max(0, 2 * center - (boardRect?.top ?? center + 28) + view.scrollY - (view.visualViewport?.offsetTop ?? 0));
          // Native hydration and browser restoration can occur after an early
          // stable sample. Settle within this bounded entry window only.
          if (Math.abs(view.scrollY - target) > 1 && corrections < 3) {
            view.scrollTo({ top: target, behavior: 'instant' });
            corrections++;
            stable = 0;
          }
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
