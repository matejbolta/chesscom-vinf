/** Reveal the phone review graph after the first primary review action only. */
export class ReviewEntryScroll {
  private document: Document | null = null;
  private used = false;
  private timer: number | null = null;
  private deadline = 0;
  private lastBottom: number | null = null;

  reconcile(document: Document): void {
    if (this.document === document) return;
    this.document = document;
    document.addEventListener("click", this.click, true);
    document.addEventListener("touchstart", this.cancel, { passive: true });
    document.addEventListener("wheel", this.cancel, { passive: true });
    document.addEventListener("keydown", this.cancel);
  }

  private readonly click = (event: MouseEvent): void => {
    const target = event.target as Element | null;
    const button = target?.closest<HTMLButtonElement>(
      ".game-controls-view-component .mobile-gr-footer-primary"
    );
    if (!button || button.disabled || button.getAttribute("aria-disabled") === "true" || this.used) return;
    this.used = true;
    this.deadline = Date.now() + 2500;
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
    if (!rect?.height || !footer) { this.schedule(); return; }
    // Wait for two matching document-space positions after native view changes.
    const view = document.defaultView!;
    const bottom = rect.bottom + view.scrollY;
    if (this.lastBottom === null || Math.abs(bottom - this.lastBottom) > 1) {
      this.lastBottom = bottom;
      this.schedule();
      return;
    }
    const visibleBottom = Math.min(view.innerHeight, footer.getBoundingClientRect().top);
    const offset = rect.bottom - visibleBottom + 8;
    if (offset > 0) view.scrollBy({ top: offset, behavior: "instant" });
  };

  private readonly cancel = (): void => {
    if (this.timer !== null) this.document?.defaultView?.clearTimeout(this.timer);
    this.timer = null;
  };

  cleanup(): void {
    this.cancel();
    this.document?.removeEventListener("click", this.click, true);
    this.document?.removeEventListener("touchstart", this.cancel);
    this.document?.removeEventListener("wheel", this.cancel);
    this.document?.removeEventListener("keydown", this.cancel);
    this.document = null;
    this.used = false;
    this.lastBottom = null;
  }
}
