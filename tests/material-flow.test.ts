import { expect, it } from 'vitest';
import { MaterialFlow } from '../src/content/material-flow';
it('joins only a nonempty native score; survives native rebuilds and restores without touching sprite nodes', () => {
  document.body.innerHTML = '<div id="board-layout-player-top"><wc-captured-pieces><div><span class="captured-pieces-cpiece captured-pieces-w-pawn"></span><span class="captured-pieces-cpiece captured-pieces-score">+12</span></div></wc-captured-pieces></div>';
  const row = document.querySelector('wc-captured-pieces > div')!;
  const original = row.innerHTML, sprite = row.firstElementChild, score = row.lastElementChild!;
  const flow = new MaterialFlow(); flow.reconcile(document); flow.reconcile(document);
  expect(row.querySelectorAll('[data-chesscom-vinf-material-join]')).toHaveLength(1);
  expect(row.firstElementChild).toBe(sprite); expect(row.lastElementChild).toBe(score);
  score.textContent = ''; flow.reconcile(document);
  expect(row.querySelector('[data-chesscom-vinf-material-join]')).toBeNull();
  row.innerHTML = original; flow.reconcile(document); flow.cleanup();
  expect(row.innerHTML).toBe(original);
});
