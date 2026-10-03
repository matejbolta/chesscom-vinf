const SOURCE = 'data-chesscom-vinf-review-action-source';
/** Proxies resolve current native controls at activation: Vue keeps its nodes,
 * handlers and time-control selection. No matching or engine API is called. */
export class ReviewRowActions {
  private rows: HTMLElement[] = [];
  private sources = new Set<HTMLElement>();
  private resize: ResizeObserver | null = null;
  private board: HTMLElement | null = null;

  reconcile(document: Document, active: boolean): void {
    if (!active) { this.cleanup(); return; }
    const hosts = ['top', 'bottom'].map(side => document.querySelector<HTMLElement>(`#board-layout-player-${side} .player-component`));
    if (hosts.some(host => !host)) { this.cleanup(); return; }
    if (this.rows.some((row, index) => row.parentElement !== hosts[index])) this.cleanup();
    const sources = this.findSources(document);
    for (const old of this.sources) if (!sources.includes(old)) { old.removeAttribute(SOURCE); this.sources.delete(old); }
    if (!sources.some(Boolean)) { this.cleanup(); return; }
    if (!this.rows.length) {
      for (const [index, name] of ['New game', 'Go to Analysis'].entries()) {
        const row = document.createElement('div');
        row.className = 'chesscom-vinf-review-row-actions'; row.dataset.chesscomVinfOwned = 'review-row-actions';
        const button = document.createElement('button'); button.type = 'button';
        button.setAttribute('aria-label', name);
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('aria-hidden', 'true');
        const path = document.createElementNS(svg.namespaceURI, 'path');
        path.setAttribute('d', index === 0 ? 'M12 4v16M4 12h16' :
          'M10.5 1a9.5 9.5 0 1 0 5.7 17.1l5.2 5.2 2-2-5.2-5.2A9.5 9.5 0 0 0 10.5 1Zm0 3a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13Zm-4 6.5h4v-4a4 4 0 0 0-4 4Zm4 0v4a4 4 0 0 0 4-4Z');
        if (index === 0) { path.setAttribute('fill', 'none'); path.setAttribute('stroke', 'currentColor'); path.setAttribute('stroke-width', '3'); path.setAttribute('stroke-linecap', 'round'); }
        svg.append(path); button.append(svg);
        button.addEventListener('click', () => {
          const source = this.findSources(document)[index];
          if (source && !source.matches(':disabled, [aria-disabled="true"]') && !source.closest('[hidden], [aria-hidden="true"]')) source.click();
        });
        row.append(button); hosts[index]!.append(row); this.rows.push(row);
      }
    }
    const board = document.querySelector<HTMLElement>('#board-layout-chessboard wc-chess-board#board-analysis-board');
    if (this.board !== board) {
      this.resize?.disconnect(); this.resize = null; this.board = board;
      const Observer = document.defaultView?.ResizeObserver;
      if (board && Observer) {
        this.resize = new Observer(() => this.align());
        this.resize.observe(board);
        hosts.forEach(host => this.resize!.observe(host!));
      }
    }
    this.align();
    sources.forEach((source, index) => {
      const button = this.rows[index].children[0] as HTMLButtonElement;
      button.hidden = !source;
      button.disabled = !source || source.matches(':disabled, [aria-disabled="true"]');
      if (!source) return;
      const label = index === 0 ? source.textContent?.trim() || 'New game' : 'Go to Analysis';
      button.setAttribute('aria-label', label); button.title = label;
      source.setAttribute(SOURCE, ''); this.sources.add(source);
    });
  }

  private align(): void {
    const board = this.board?.getBoundingClientRect();
    if (!board?.width) return;
    const center = board.left + board.width / 2;
    for (const row of this.rows) {
      const host = row.parentElement?.getBoundingClientRect();
      if (!host?.width) continue;
      const shift = `${center - (host.left + host.width / 2)}px`;
      if (row.style.getPropertyValue('--vinf-review-board-offset') !== shift)
        row.style.setProperty('--vinf-review-board-offset', shift);
    }
  }

  private findSources(document: Document): (HTMLElement | null)[] {
    const newGame = [...document.querySelectorAll<HTMLElement>('.move-by-move-buttons button')]
      .find(button => /^New\s+(?:\d|Game\b)/i.test(button.textContent?.trim() ?? '')) ?? null;
    const engine = document.querySelector<HTMLElement>('.sidebar-header-header button[aria-label="Go to Analysis"]');
    return [newGame, engine];
  }
  cleanup(): void {
    this.resize?.disconnect(); this.resize = null; this.board = null;
    this.sources.forEach(source => source.removeAttribute(SOURCE)); this.sources.clear();
    this.rows.forEach(row => row.remove()); this.rows = [];
  }
}
