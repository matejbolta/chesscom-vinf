/** One graph reveal after the native first Review action settles. Never replay moves. */
export class ReviewEntryScroll {
  private document: Document | null = null;
  private used = false;
  private timer: number | null = null;
  private deadline = 0;
  private lastGeometry = '';
  private stableSince = 0;

  reconcile(document: Document): void {
    if (this.document === document) return;
    this.document = document;
    document.addEventListener('click', this.click, true);
    document.addEventListener('touchmove', this.cancel, { passive: true });
    document.addEventListener('wheel', this.cancel, { passive: true });
    document.addEventListener('keydown', this.cancel);
  }

  private readonly click = (event: MouseEvent): void => {
    const button = (event.target as Element | null)?.closest<HTMLButtonElement>(
      '.game-controls-view-component .mobile-gr-footer-primary, [data-chesscom-vinf-review-dock] button[aria-label="Next Move"]');
    if (!button || button.disabled || button.getAttribute('aria-disabled') === 'true' || this.used) return;
    this.used = true;
    this.deadline = Date.now() + 10000;
    this.schedule();
  };

  private schedule(): void {
    this.timer = this.document!.defaultView!.setTimeout(this.reveal, 150);
  }

  private readonly reveal = (): void => {
    this.timer = null;
    const document = this.document;
    if (!document || Date.now() > this.deadline) return;
    const graph = document.querySelector<HTMLElement>('#charts > [data-chesscom-vinf-review-graph="moved"]');
    const footer = document.querySelector<HTMLElement>('.game-controls-view-component > .mobile-gr-footer-footer');
    const rect = graph?.getBoundingClientRect();
    // Start animates through native moves; don't scroll halfway through it.
    if (!rect?.height || !footer || footer.querySelector('[aria-label="Start Review"]')) {
      this.schedule(); return;
    }
    const view = document.defaultView!;
    const viewportBottom = view.visualViewport ? view.visualViewport.offsetTop + view.visualViewport.height : view.innerHeight;
    const visibleBottom = Math.min(viewportBottom, footer.getBoundingClientRect().top);
    const geometry = [rect.bottom + view.scrollY, rect.height, visibleBottom].map(Math.round).join(':');
    if (geometry !== this.lastGeometry) {
      this.lastGeometry = geometry; this.stableSince = Date.now();
    }
    if (Date.now() - this.stableSince < 450) { this.schedule(); return; }
    const offset = rect.bottom - visibleBottom + 8;
    if (offset > 1) view.scrollBy({ top: offset, behavior: 'instant' });
    // One correction only. Later commentary and rapid taps never rearm scrolling.
  };

  private readonly cancel = (): void => {
    if (this.timer !== null) this.document?.defaultView?.clearTimeout(this.timer);
    this.timer = null;
  };

  cleanup(): void {
    this.cancel();
    this.document?.removeEventListener('click', this.click, true);
    this.document?.removeEventListener('touchmove', this.cancel);
    this.document?.removeEventListener('wheel', this.cancel);
    this.document?.removeEventListener('keydown', this.cancel);
    this.document = null; this.used = false; this.lastGeometry = '';
  }
}
