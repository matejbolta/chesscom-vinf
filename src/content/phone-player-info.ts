/** Hide only the native identity block, leaving a stable, keyboard-accessible
 * avatar target and all game/clock controls untouched. No account data is stored. */
export class PhonePlayerInfoController {
  private entries = new Map<HTMLElement, HTMLButtonElement>();

  reconcile(document: Document): void {
    const contents = new Set(document.querySelectorAll<HTMLElement>(
      '#board-layout-player-top .player-playerContent, #board-layout-player-bottom .player-playerContent'
    ));
    for (const [content, button] of this.entries) {
      if (!contents.has(content) || !button.isConnected) {
        content.removeAttribute('data-chesscom-vinf-player-hidden');
        button.remove(); this.entries.delete(content);
      }
    }
    for (const content of contents) {
      if (this.entries.has(content) || !content.querySelector('.player-avatar')) continue;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'chesscom-vinf-player-toggle';
      button.dataset.chesscomVinfOwned = 'player-toggle';
      const side = content.closest('#board-layout-player-top') ? 'Opponent' : 'Your';
      const update = (hidden: boolean) => {
        content.toggleAttribute('data-chesscom-vinf-player-hidden', hidden);
        button.setAttribute('aria-pressed', String(hidden));
        button.setAttribute('aria-label', `${hidden ? 'Show' : 'Hide'} ${side.toLowerCase()} player information`);
      };
      update(false);
      button.addEventListener('click', event => {
        event.preventDefault(); event.stopPropagation();
        update(!content.hasAttribute('data-chesscom-vinf-player-hidden'));
      });
      content.append(button);
      this.entries.set(content, button);
    }
  }

  cleanup(): void {
    for (const [content, button] of this.entries) {
      content.removeAttribute('data-chesscom-vinf-player-hidden'); button.remove();
    }
    this.entries.clear();
  }
}
