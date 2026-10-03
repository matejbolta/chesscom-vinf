const SOURCE = 'data-chesscom-vinf-review-action-source';
/** Proxies resolve current native controls at activation: Vue keeps its nodes,
 * handlers and time-control selection. No matching or engine API is called. */
export class ReviewRowActions {
  private row: HTMLElement | null = null;
  private sources = new Set<HTMLElement>();

  reconcile(document: Document, active: boolean): void {
    if (!active) { this.cleanup(); return; }
    const host = document.querySelector<HTMLElement>('#board-layout-player-top .player-component');
    if (!host) { this.cleanup(); return; }
    if (this.row?.parentElement !== host) this.cleanup();
    const sources = this.findSources(document);
    for (const old of this.sources) if (!sources.includes(old)) { old.removeAttribute(SOURCE); this.sources.delete(old); }
    if (!sources.some(Boolean)) { this.cleanup(); return; }
    if (!this.row) {
      this.row = document.createElement('div');
      this.row.className = 'chesscom-vinf-review-row-actions'; this.row.dataset.chesscomVinfOwned = 'review-row-actions';
      for (const [index, name] of ['New game', 'Go to Analysis'].entries()) {
        const button = document.createElement('button'); button.type = 'button';
        button.setAttribute('aria-label', name);
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('aria-hidden', 'true');
        const path = document.createElementNS(svg.namespaceURI, 'path');
        path.setAttribute('d', index === 0 ? 'M10.5 3h3v7.5H21v3h-7.5V21h-3v-7.5H3v-3h7.5Z' :
          'M10.5 1a9.5 9.5 0 1 0 5.7 17.1l5.2 5.2 2-2-5.2-5.2A9.5 9.5 0 0 0 10.5 1Zm0 3a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13Zm-4 6.5h4v-4a4 4 0 0 0-4 4Zm4 0v4a4 4 0 0 0 4-4Z');
        svg.append(path); button.append(svg);
        button.addEventListener('click', () => {
          const source = this.findSources(document)[index];
          if (source && !source.matches(':disabled, [aria-disabled="true"]') && !source.closest('[hidden], [aria-hidden="true"]')) source.click();
        });
        this.row.append(button);
      }
      host.append(this.row);
    }
    sources.forEach((source, index) => {
      const button = this.row!.children[index] as HTMLButtonElement;
      button.hidden = !source;
      button.disabled = !source || source.matches(':disabled, [aria-disabled="true"]');
      if (!source) return;
      const label = index === 0 ? source.textContent?.trim() || 'New game' : 'Go to Analysis';
      button.setAttribute('aria-label', label); button.title = label;
      source.setAttribute(SOURCE, ''); this.sources.add(source);
    });
  }

  private findSources(document: Document): (HTMLElement | null)[] {
    const newGame = [...document.querySelectorAll<HTMLElement>('.move-by-move-buttons button')]
      .find(button => /^New\s+(?:\d|Game\b)/i.test(button.textContent?.trim() ?? '')) ?? null;
    const engine = document.querySelector<HTMLElement>('.sidebar-header-header button[aria-label="Go to Analysis"]');
    return [newGame, engine];
  }
  cleanup(): void {
    this.sources.forEach(source => source.removeAttribute(SOURCE)); this.sources.clear();
    this.row?.remove(); this.row = null;
  }
}
