import { expect, it } from 'vitest';
import { WideBoardRows } from '../src/content/wide-board-rows';
import { DEFAULT_SETTINGS } from '../src/shared/settings';
it('scopes shared rows to wide supported boards without applying phone or review cleanup', () => {
  document.documentElement.className = 'user-logged-in';
  document.body.innerHTML = '<div id="board-layout-player-top"><div class="player-component"></div></div><div id="board-layout-player-bottom"><div class="player-component"></div></div>';
  const controller = new WideBoardRows();
  const route = {protocol:'https:',hostname:'www.chess.com',pathname:'/game/123'};
  controller.reconcile(document,route,DEFAULT_SETTINGS,true);
  expect(document.documentElement.hasAttribute('data-chesscom-vinf-wide-game-rows')).toBe(true);
  for (const path of ['/analysis/game/live/123/review','/analysis/game/live/123/analysis']) {
    controller.reconcile(document,{...route,pathname:path},DEFAULT_SETTINGS,true);
    expect(document.documentElement.hasAttribute('data-chesscom-vinf-wide-rows')).toBe(true);
    expect(document.documentElement.hasAttribute('data-chesscom-vinf-wide-game-rows')).toBe(false);
    expect(document.documentElement.hasAttribute('data-chesscom-vinf-review-clean')).toBe(false);
  }
  controller.reconcile(document,route,DEFAULT_SETTINGS,false);
  expect(document.documentElement.hasAttribute('data-chesscom-vinf-wide-rows')).toBe(false);
});
