const MARKER = 'data-chesscom-vinf-material-join';

/** Keep native inline sprite widths and line breaking. A zero-width word joiner
 * prevents an advantage score breaking away from its final sprite, without
 * negative margins, guessed score widths, measuring or reparenting native nodes. */
export class MaterialFlow {
  private joins = new Set<HTMLElement>();
  reconcile(document: Document): void {
    for (const join of this.joins) {
      if (!join.isConnected || !join.nextElementSibling?.matches('.captured-pieces-score') ||
          !join.nextElementSibling?.textContent?.trim() ||
          !join.previousElementSibling?.matches('.captured-pieces-cpiece:not(.captured-pieces-score)')) {
        join.remove(); this.joins.delete(join);
      }
    }
    for (const score of document.querySelectorAll<HTMLElement>(
      '#board-layout-player-top wc-captured-pieces .captured-pieces-score, #board-layout-player-bottom wc-captured-pieces .captured-pieces-score'
    )) {
      if (!score.textContent?.trim() || score.previousElementSibling?.hasAttribute(MARKER) ||
          !score.previousElementSibling?.matches('.captured-pieces-cpiece:not(.captured-pieces-score)')) continue;
      const join = document.createElement('span'); join.setAttribute(MARKER, '');
      join.setAttribute('data-chesscom-vinf-owned', 'material-join'); join.setAttribute('aria-hidden', 'true');
      join.textContent = '\u2060'; score.before(join); this.joins.add(join);
    }
  }
  cleanup(): void { this.joins.forEach(join => join.remove()); this.joins.clear(); }
}
