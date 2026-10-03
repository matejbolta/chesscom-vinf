const MARKER = 'data-chesscom-vinf-review-dock';
const LABELS = new Set(['Explain', 'Hint', 'Best', 'Resume', 'Start Review', 'Next', 'Previous Move', 'Next Move', 'Share']);

/** Style known native phone controls in place; Vue retains every button/handler. */
export class ReviewDock {
  private dock: HTMLElement | null = null;

  reconcile(document: Document): void {
    const dock = document.querySelector<HTMLElement>('.game-controls-view-component > .mobile-gr-footer-footer');
    if (dock !== this.dock) this.cleanup();
    const buttons = dock ? [...dock.querySelectorAll('button')] : [];
    const known = buttons.length > 0 && buttons.every(button => LABELS.has(button.getAttribute('aria-label') ?? '')) &&
      buttons.some(button => button.getAttribute('aria-label') === 'Previous Move') &&
      buttons.some(button => button.getAttribute('aria-label') === 'Next Move');
    if (!dock || !known) { this.cleanup(); return; }
    this.dock = dock;
    if (!dock.hasAttribute(MARKER)) dock.setAttribute(MARKER, '');
  }

  cleanup(): void { this.dock?.removeAttribute(MARKER); this.dock = null; }
}
