/** A bounded, user-cancellable first Review action. Native buttons own moves. */
export class ReviewEntryScroll {
  private document: Document | null = null;
  private used = false;
  private timer: number | null = null;
  private deadline = 0;
  private lastBottom: number | null = null;
  private stableSince = 0;
  private start: { board: string; speech: string; changedAt: number; began: number } | null = null;

  reconcile(document: Document): void {
    if (this.document === document) return;
    this.document = document;
    document.addEventListener('click', this.click, true);
    document.addEventListener('touchmove', this.cancel, { passive: true });
    document.addEventListener('wheel', this.cancel, { passive: true });
    document.addEventListener('keydown', this.cancel);
  }

  private signature(): string {
    return [...this.document!.querySelectorAll('#board-analysis-board .piece')]
      .map(piece => piece.className).sort().join('|');
  }

  private speech(): string {
    return this.document?.querySelector('.mobile-top-section-container')?.textContent?.trim() ?? '';
  }

  private isStart(button: Element): boolean {
    return button.getAttribute('aria-label') === 'Start Review' &&
      !!button.querySelector('[data-glyph="move-circle-best"]');
  }

  private readonly click = (event: MouseEvent): void => {
    const button = (event.target as Element | null)?.closest<HTMLButtonElement>(
      '.game-controls-view-component .mobile-gr-footer-primary, [data-chesscom-vinf-review-dock] button[aria-label="Next Move"]');
    if (!button || button.disabled || button.getAttribute('aria-disabled') === 'true') return;
    if (this.used) { this.start = null; return; }
    this.used = true;
    this.deadline = Date.now() + 10000;
    const board = this.signature();
    if (this.isStart(button) && board) this.start = {
      board, speech: this.speech(), changedAt: 0, began: Date.now()
    };
    this.schedule();
  };

  private schedule(): void {
    this.timer = this.document!.defaultView!.setTimeout(this.reveal, 150);
  }

  private readonly reveal = (): void => {
    this.timer = null;
    const document = this.document;
    if (!document || Date.now() > this.deadline) { this.start = null; return; }
    if (this.start) {
      const start = this.start;
      const button = document.querySelector<HTMLButtonElement>('.game-controls-view-component .mobile-gr-footer-primary');
      if (this.signature() !== start.board || !button || !this.isStart(button)) this.start = null;
      else {
        const speech = this.speech();
        if (speech !== start.speech) { start.speech = speech; start.changedAt = Date.now(); }
        // Some native starts finish generating the report but leave the same
        // Start control and untouched board. Honour that one queued intent only
        // after the report changes and settles. Never replay Next or advance an
        // already-changing board; a second user click cancels this fallback.
        if (start.changedAt && Date.now() - start.changedAt >= 900 &&
            Date.now() - start.began >= 2000 && !button.disabled &&
            button.getAttribute('aria-disabled') !== 'true' &&
            !document.documentElement.hasAttribute('data-chesscom-vinf-review-clean')) {
          this.start = null;
          button.click();
        }
      }
    }
    const graph = document.querySelector<HTMLElement>('#charts > [data-chesscom-vinf-review-graph="moved"]');
    const footer = document.querySelector<HTMLElement>('.game-controls-view-component > .mobile-gr-footer-footer');
    const rect = graph?.getBoundingClientRect();
    if (!rect?.height || !footer) { this.schedule(); return; }
    const view = document.defaultView!;
    const bottom = rect.bottom + view.scrollY;
    if (this.lastBottom === null || Math.abs(bottom - this.lastBottom) > 1) {
      this.lastBottom = bottom; this.stableSince = Date.now();
    }
    // Don't gate on coach text: native commentary may be absent or still loading.
    // Keep the graph clear of both the fixed dock and Android's visual viewport.
    const viewportBottom = view.visualViewport ? view.visualViewport.offsetTop + view.visualViewport.height : view.innerHeight;
    const visibleBottom = Math.min(viewportBottom, footer.getBoundingClientRect().top);
    const offset = rect.bottom - visibleBottom + 8;
    if (Date.now() - this.stableSince >= 300 && offset > 1) view.scrollBy({ top: offset, behavior: 'instant' });
    // Stop after a quiet startup; never follow later moves indefinitely.
    if (!this.start && Date.now() >= this.deadline - 6000 && Date.now() - this.stableSince >= 1200) return;
    this.schedule();
  };

  private readonly cancel = (): void => {
    if (this.timer !== null) this.document?.defaultView?.clearTimeout(this.timer);
    this.timer = null; this.start = null;
  };

  cleanup(): void {
    this.cancel();
    this.document?.removeEventListener('click', this.click, true);
    this.document?.removeEventListener('touchmove', this.cancel);
    this.document?.removeEventListener('wheel', this.cancel);
    this.document?.removeEventListener('keydown', this.cancel);
    this.document = null; this.used = false; this.lastBottom = null;
  }
}
