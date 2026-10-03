/** Keep Vue-owned header controls in place; proxies forward to the current native buttons. */
export class AnalysisRowActions {
  private pendingBoardUntil = 0;
  private controls: HTMLButtonElement[] = [];
  private sources = new Set<HTMLElement>();
  private observer: ResizeObserver | null = null;
  private board: HTMLElement | null = null;
  private host: HTMLElement | null = null;
  reconcile(document: Document, active: boolean): void {
    const host = document.querySelector<HTMLElement>('#board-layout-player-bottom .player-component');
    const board = document.querySelector<HTMLElement>('#board-analysis-board');
    if (!active || !host || !board) { this.cleanup(); return; }
    if (this.host !== host || this.board !== board) {
      this.cleanup(); this.host = host; this.board = board;
      const Observer = document.defaultView?.ResizeObserver;
      if (Observer) { this.observer = new Observer(() => this.align()); this.observer.observe(board); this.observer.observe(host); }
    }
    const names = ['Back', 'Settings'];
    for (const old of this.sources) if (!old.isConnected) { old.removeAttribute('data-vinf-analysis-source'); this.sources.delete(old); }
    names.forEach((name, index) => {
      const source = document.querySelector<HTMLButtonElement>(`.sidebar-header-header button[aria-label="${name}"]`);
      let proxy = this.controls[index];
      if (!proxy) {
        proxy = document.createElement('button'); proxy.type = 'button';
        proxy.className = 'chesscom-vinf-analysis-row-action'; proxy.dataset.chesscomVinfOwned = 'analysis-row-action';
        proxy.setAttribute('aria-label',name);
        proxy.addEventListener('click', () => {
          const current = document.querySelector<HTMLButtonElement>(`.sidebar-header-header button[aria-label="${name}"]`);
          if (current && !current.disabled && current.getAttribute('aria-disabled') !== 'true') {
            if (index === 1) this.pendingBoardUntil = Date.now() + 1500;
            current.click();
            this.selectBoardTab(document);
          }
        });
        host.append(proxy); this.controls[index] = proxy;
      }
      const destination = index === 0 ? host : document.querySelector<HTMLElement>('.analysis-options-bar');
      if (destination && proxy.parentElement !== destination) destination.append(proxy);
      proxy.classList.toggle('chesscom-vinf-analysis-settings-action', index === 1);
      if (index === 1) { proxy.style.removeProperty('left'); proxy.style.removeProperty('width'); proxy.setAttribute('aria-label','Board settings'); proxy.title = 'Board settings'; }
      proxy.hidden = !source || !destination; proxy.disabled = !!source?.disabled;
      if (!destination) { source?.removeAttribute('data-vinf-analysis-source'); return; }
      if (source) {
        if (proxy.innerHTML !== source.innerHTML) proxy.innerHTML = source.innerHTML;
        source.setAttribute('data-vinf-analysis-source',''); this.sources.add(source);
      }
    });
    this.align();
    this.selectBoardTab(document);
  }
  private selectBoardTab(document: Document): void {
    if (Date.now() > this.pendingBoardUntil) return;
    const tab = [...document.querySelectorAll<HTMLButtonElement>('[role="dialog"] [role="tablist"] button')]
      .find(button => button.textContent?.trim() === 'Board');
    if (tab && !tab.disabled) { this.pendingBoardUntil = 0; tab.click(); }
  }
  private align(): void {
    const board = this.board?.getBoundingClientRect(), host = this.host?.getBoundingClientRect();
    if (!board?.width || !host?.width) return;
    const button = this.controls[0];
    if (button) {
      const left = `${board.left + board.width / 2 - host.left}px`;
      if (button.style.left !== left) button.style.left = left;
      button.style.width = '44px';
    }
  }
  cleanup(): void {
    this.pendingBoardUntil = 0;
    this.observer?.disconnect(); this.observer = null;
    this.controls.forEach(button=>button.remove()); this.controls=[];
    this.sources.forEach(source=>source.removeAttribute('data-vinf-analysis-source')); this.sources.clear();
    this.host=null; this.board=null;
  }
}
