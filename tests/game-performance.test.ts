import { readFileSync } from 'node:fs';
import { expect, it, vi } from 'vitest';
import { startVinfRuntime } from '../src/content/runtime';
import { DEFAULT_SETTINGS } from '../src/shared/settings';
import { PhoneExperienceController } from '../src/content/phone-experience-controller';
import { ExtremeOledController } from '../src/content/extreme-oled-controller';
import { installAnnotationFixture } from './helpers/native-annotations';

it('measures VINF work during native drag frames and unchanged-square drawing', async () => {
  vi.useFakeTimers();
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  vi.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue('Mozilla Android Mobile Firefox/130.0');
  vi.stubGlobal('matchMedia', () => ({ matches: true, addEventListener() {} }));
  document.documentElement.innerHTML = new DOMParser().parseFromString(readFileSync('tests/fixtures/phone-game.html', 'utf8'), 'text/html').documentElement.innerHTML;
  document.documentElement.className = 'user-logged-in';
  window.history.replaceState({}, '', '/game/123456');
  const board = document.querySelector<HTMLElement>('#board-single')!;
  const api = installAnnotationFixture(board);
  const bounds = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({left:0,top:100,width:400,height:400,right:400,bottom:500} as DOMRect);
  const phone = vi.spyOn(PhoneExperienceController.prototype, 'reconcile');
  const clocks = vi.spyOn(ExtremeOledController.prototype, 'reconcile');
  const factory = vi.spyOn(api.factory, 'buildStandardArrow');
  let settingsChanged = (_settings: typeof DEFAULT_SETTINGS) => {};
  startVinfRuntime({load: async () => DEFAULT_SETTINGS, subscribe: fn => { settingsChanged = fn; }});
  await vi.advanceTimersByTimeAsync(1000);
  const piece = board.querySelector<HTMLElement>('.piece')!;
  bounds.mockClear(); phone.mockClear(); clocks.mockClear();
  for (let i=0;i<60;i++) {
    piece.style.transform = `translate(${i}px, ${i}px)`;
    await vi.advanceTimersByTimeAsync(16);
  }
  const drag = {bounds: bounds.mock.calls.length, phone:phone.mock.calls.length, clocks:clocks.mock.calls.length};
  document.querySelector<HTMLButtonElement>('.chesscom-vinf-annotation-toggle')!.click();
  const layer = document.querySelector('.chesscom-vinf-annotations')!;
  const pointer = (type: string, x: number, y: number) => {
    const event = new MouseEvent(type, {bubbles:true,cancelable:true,clientX:x,clientY:y});
    Object.defineProperty(event,'pointerId',{value:1});layer.dispatchEvent(event);
  };
  factory.mockClear();
  pointer('pointerdown',25,125);
  for(let i=0;i<30;i++) { pointer('pointermove',170+i/10,320); await vi.advanceTimersByTimeAsync(16); }
  const previews = factory.mock.calls.length;
  pointer('pointerup',170,320);
  // 2.7.1 baseline: 366 geometry reads / 15 phone reconciles / 30 previews.
  // The remaining budget allows the 750ms lifecycle fallback, not per-frame work.
  expect(drag.bounds).toBeLessThanOrEqual(12);
  expect(drag.phone).toBeLessThanOrEqual(2);
  expect(drag.clocks).toBeLessThanOrEqual(2);
  expect(previews).toBe(0);
  expect(factory).toHaveBeenCalledTimes(1); // release only
  bounds.mockClear(); phone.mockClear(); clocks.mockClear();
  const timer = document.querySelector('#board-layout-player-bottom [role="timer"]')!;
  for (let i=0;i<10;i++) { timer.textContent = `9:${59-i}`; await vi.advanceTimersByTimeAsync(100); }
  expect(document.querySelector('.chesscom-vinf-extreme-time.bottom')!.textContent).toBe('9:50');
  expect(bounds.mock.calls.length).toBeLessThanOrEqual(12);
  expect(clocks.mock.calls.length).toBeLessThanOrEqual(2);
  expect(board.querySelectorAll('.arrow')).toHaveLength(1);
  piece.classList.replace('square-18', 'square-28');
  await vi.advanceTimersByTimeAsync(20);
  expect(board.querySelectorAll('.arrow')).toHaveLength(0); // real square changes still clear marks
  bounds.mockClear();
  board.style.width = '380px';
  await vi.advanceTimersByTimeAsync(20);
  expect(bounds.mock.calls.length).toBeGreaterThan(0); // root geometry changes still reposition

  settingsChanged({...DEFAULT_SETTINGS,enabled:false});
  vi.clearAllTimers();vi.useRealTimers();vi.restoreAllMocks();vi.unstubAllGlobals();
});
