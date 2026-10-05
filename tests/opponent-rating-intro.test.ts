import { afterEach, expect, it, vi } from "vitest";
import { OpponentRatingIntro } from "../src/content/opponent-rating-intro";

let controller = new OpponentRatingIntro();
function fixture(opponent = 1400, own = 1300) {
  vi.useFakeTimers();
  sessionStorage.clear();
  document.body.innerHTML = `<div id="board-layout-player-top"><div class="player-component"><div class="cc-user-rating-white">(${opponent})</div></div></div><div id="board-layout-player-bottom"><div class="cc-user-rating-white">(${own})</div></div><wc-simple-move-list board-id="board-single"></wc-simple-move-list>`;
  controller = new OpponentRatingIntro();
}
const label = () => document.querySelector('.chesscom-vinf-opponent-rating-intro');
afterEach(() => { controller.cleanup(); vi.useRealTimers(); });
it.each([[1400, '(+100)'], [1200, '(−100)'], [1300, '(=0)']])('shows opponent %s and the signed difference for 30 seconds', (opponent, difference) => {
  fixture(opponent);
  controller.reconcile(document, '/game/123');
  expect(label()?.textContent).toBe(`${opponent} ${difference}`);
  vi.advanceTimersByTime(30_000);
  expect(label()).toBeNull();
  controller.reconcile(document, '/game/123');
  expect(label()).toBeNull();
});
it('preserves the deadline on reload and does not introduce a mid-game rating', () => {
  fixture();
  controller.reconcile(document, '/game/123');
  vi.advanceTimersByTime(20_000);
  controller.cleanup();
  document.querySelector('wc-simple-move-list')!.innerHTML = '<div data-node="0-0">e4</div>';
  controller = new OpponentRatingIntro();
  controller.reconcile(document, '/game/123');
  expect(label()).not.toBeNull();
  vi.advanceTimersByTime(10_000);
  expect(label()).toBeNull();
  controller.reconcile(document, '/game/456');
  expect(label()).toBeNull();
  expect(sessionStorage.getItem('chesscom-vinf-rating-intro')).not.toContain('1400');
});
