import { readFileSync } from 'node:fs';
import { afterEach, expect, it, vi } from 'vitest';
import { ReviewPresentationController } from '../src/content/review-presentation';
import { ExtremeOledController } from '../src/content/extreme-oled-controller';
import { DEFAULT_SETTINGS } from '../src/shared/settings';

const location = {protocol:'https:',hostname:'www.chess.com',pathname:'/analysis/game/live/123456/review'};
const controller = new ReviewPresentationController();
function fixture() {
  const parsed = new DOMParser().parseFromString(readFileSync('tests/fixtures/game-review-narrow.html','utf8'),'text/html');
  document.documentElement.innerHTML = parsed.documentElement.innerHTML;
  document.documentElement.className = 'user-logged-in';
}
afterEach(() => controller.cleanup(document));
it('keeps native review nodes and actions; independently styles Extreme and restores on overview, disable and departure', () => {
  fixture();
  const board = document.querySelector<HTMLElement>('#board-analysis-board')!;
  const graph = document.querySelector('.game-arc-component')!;
  const text = document.querySelector('.move-feedback-speech-text-component')!;
  const clock = document.querySelector('.move-time-content')!;
  const best = document.querySelector<HTMLButtonElement>('.flow-buttons-component [aria-label="Best"]')!;
  const click = vi.fn(); best.addEventListener('click',click);
  const original = board.outerHTML;
  for (const phone of [true,false]) {
    for (const extremeOled of [false,true]) {
      controller.reconcile(document,location,{...DEFAULT_SETTINGS,extremeOled},phone);
      expect(document.documentElement.hasAttribute('data-chesscom-vinf-review-clean')).toBe(true);
      expect(document.documentElement.hasAttribute('data-chesscom-vinf-review-extreme')).toBe(extremeOled);
      text.textContent = 'Native coach update'; clock.textContent = '8:40';
      expect(document.querySelector('.game-arc-component')).toBe(graph);
      expect(document.querySelector('#board-analysis-board')).toBe(board);
    }
  }
  best.click(); expect(click).toHaveBeenCalledOnce();
  const live = new ExtremeOledController();
  expect(live.reconcile(document,location,{...DEFAULT_SETTINGS,extremeOled:true},true,true)).toBe(false);
  expect(document.querySelector('.chesscom-vinf-extreme-controls')).toBeNull();
  const moves = document.querySelector('.move-by-move-container')!;
  moves.remove(); controller.reconcile(document,location,{...DEFAULT_SETTINGS,extremeOled:true},false);
  expect(document.documentElement.hasAttribute('data-chesscom-vinf-review-clean')).toBe(false);
  expect(board.outerHTML).toBe(original);
  document.querySelector('.sidebar-view-content')!.append(moves);
  for (const [route,settings] of [[location,{...DEFAULT_SETTINGS,enabled:false}], [{...location,pathname:'/game/123456'},DEFAULT_SETTINGS]] as const) {
    controller.reconcile(document,location,{...DEFAULT_SETTINGS,extremeOled:true},false);
    controller.reconcile(document,route,settings,false);
    expect(board.outerHTML).toBe(original);
    expect(document.documentElement.hasAttribute('data-chesscom-vinf-review-extreme')).toBe(false);
  }
});
it('mutes wide review through the native control before hiding, and leaves unknown audio states visible', () => {
  fixture();
  const button = document.querySelector<HTMLButtonElement>('[aria-label="Toggle Coach Audio"]')!;
  const svg = button.querySelector('svg')!;
  svg.setAttribute('data-glyph','media-audio-speaker');
  const click = vi.fn(() => svg.setAttribute('data-glyph','media-audio-speaker-mute'));
  button.addEventListener('click',click);
  controller.reconcile(document,location,DEFAULT_SETTINGS,false);
  expect(click).toHaveBeenCalledOnce();
  expect(button.hasAttribute('data-chesscom-vinf-review-muted')).toBe(true);
  svg.setAttribute('data-glyph','unknown');
  controller.reconcile(document,location,DEFAULT_SETTINGS,false);
  expect(button.hasAttribute('data-chesscom-vinf-review-muted')).toBe(false);
  expect(click).toHaveBeenCalledOnce();
  controller.cleanup(document);
});
