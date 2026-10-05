import { isChessComLiveGameReview } from './game-review-layout-controller';
import type { ExtensionSettings, LocationLike } from '../shared/models';

/** Wide native Review exposes coach actions separately from navigation. Proxy
 * only their activation; the site's nodes, listeners and state stay intact. */
export class WideReviewControls {
  private dock: HTMLElement | null = null;
  private hidden = new Set<HTMLElement>();

  reconcile(document: Document, location: LocationLike, settings: ExtensionSettings, wide: boolean): void {
    const host = document.querySelector<HTMLElement>('.game-controls-view-component');
    if (!wide || !settings.enabled || !isChessComLiveGameReview(location) ||
        !document.documentElement.classList.contains('user-logged-in') || !host) { this.cleanup(); return; }
    if (this.dock?.parentElement !== host) this.cleanup();
    const sources = this.sources(document);
    if (!sources.some(Boolean)) { this.cleanup(); return; }
    if (!this.dock) {
      this.dock = document.createElement('div');
      this.dock.className = 'chesscom-vinf-wide-review-dock';
      this.dock.dataset.chesscomVinfOwned = 'wide-review-dock';
      for (let index = 0; index < 4; index++) {
        const button = document.createElement('button'); button.type = 'button';
        button.style.gridColumn = String(index + 1);
        button.addEventListener('click', () => {
          const source = this.sources(document)[index];
          if (source && !source.matches(':disabled,[aria-disabled="true"]')) source.click();
        });
        this.dock.append(button);
      }
      host.append(this.dock);
    }
    sources.forEach((source, index) => {
      const button = this.dock!.children[index] as HTMLButtonElement;
      const name = source?.getAttribute('aria-label') || source?.textContent?.trim() || '';
      button.hidden = !source;
      button.disabled = !source || source.matches(':disabled,[aria-disabled="true"]');
      if (button.getAttribute('aria-label') !== name) { button.setAttribute('aria-label', name); button.title = name; }
      const icon = source?.querySelector('svg');
      const signature = icon?.outerHTML || name;
      if (button.dataset.icon !== signature) {
        button.dataset.icon = signature;
        button.replaceChildren(icon ? icon.cloneNode(true) : document.createTextNode(name));
      }
    });
    const hidden = new Set(document.querySelectorAll<HTMLElement>(
      '.game-controls-view-component > .game-controls-primary-component, .game-controls-view-component > .tertiary-controls-component-component, .move-by-move-coach-section .flow-buttons-component'
    ));
    const start = sources[2];
    if (start?.getAttribute('aria-label') === 'Start Review' || start?.textContent?.trim() === 'Start Review') hidden.add(start);
    for (const old of this.hidden) if (!hidden.has(old)) old.removeAttribute('data-chesscom-vinf-wide-control-source');
    for (const element of hidden) if (!element.hasAttribute('data-chesscom-vinf-wide-control-source')) element.setAttribute('data-chesscom-vinf-wide-control-source', '');
    this.hidden = hidden;
  }

  private sources(document: Document): (HTMLButtonElement | null)[] {
    const flow = [...document.querySelectorAll<HTMLButtonElement>('.move-by-move-coach-section .flow-buttons-component button')];
    const named = (names: string[]) => flow.find(button => names.includes(button.getAttribute('aria-label') || button.textContent?.trim() || '')) ?? null;
    const start = [...document.querySelectorAll<HTMLButtonElement>('.overview-view-component button, .overview-view-container button')]
      .find(button => button.getAttribute('aria-label') === 'Start Review' || button.textContent?.trim() === 'Start Review') ?? null;
    return [named(['Explain', 'Hint']), document.querySelector('.game-controls-primary-component button[aria-label="Previous Move"]'),
      start ?? document.querySelector('.game-controls-primary-component button[aria-label="Next Move"]'), named(['Best', 'Resume'])];
  }

  cleanup(): void {
    this.hidden.forEach(element => element.removeAttribute('data-chesscom-vinf-wide-control-source')); this.hidden.clear();
    this.dock?.remove(); this.dock = null;
  }
}
