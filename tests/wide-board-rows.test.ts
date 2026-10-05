import { expect, it, vi } from 'vitest';
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

it.each([false, true])('shows a five-second reload rating on wide layouts (Extreme %s)', extremeOled => {
  vi.useFakeTimers();
  sessionStorage.clear();
  document.documentElement.className = 'user-logged-in';
  document.body.innerHTML = '<div id="board-layout-player-top"><div class="player-component"><span class="cc-user-rating-white">1400</span></div></div><div id="board-layout-player-bottom"><span class="cc-user-rating-white">1300</span></div><wc-simple-move-list board-id="board-single"><span data-node="0-0">e4</span></wc-simple-move-list>';
  const original = Object.getOwnPropertyDescriptor(performance, 'getEntriesByType');
  Object.defineProperty(performance, 'getEntriesByType', {configurable:true,value:()=>[{type:'reload',name:'https://www.chess.com/game/123'}]});
  const controller = new WideBoardRows();
  const route = {protocol:'https:',hostname:'www.chess.com',pathname:'/game/123'};
  try {
    controller.reconcile(document, route, {...DEFAULT_SETTINGS,extremeOled}, true);
    expect(document.querySelector('.chesscom-vinf-opponent-rating-intro')?.textContent).toBe('1400 (+100)');
    expect(document.documentElement.hasAttribute('data-chesscom-vinf-wide-extreme')).toBe(extremeOled);
    vi.advanceTimersByTime(5000);
    expect(document.querySelector('.chesscom-vinf-opponent-rating-intro')).toBeNull();
    controller.reconcile(document, route, {...DEFAULT_SETTINGS,extremeOled}, true);
    expect(document.querySelector('.chesscom-vinf-opponent-rating-intro')).toBeNull();
    controller.reconcile(document, route, DEFAULT_SETTINGS, false);
    expect(document.documentElement.hasAttribute('data-chesscom-vinf-wide-extreme')).toBe(false);
  } finally {
    controller.reconcile(document, route, DEFAULT_SETTINGS, false);
    if (original) Object.defineProperty(performance, 'getEntriesByType', original); else Reflect.deleteProperty(performance, 'getEntriesByType');
    vi.useRealTimers();
  }
});
