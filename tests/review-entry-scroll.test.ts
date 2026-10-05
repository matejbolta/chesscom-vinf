import { expect, it, vi } from 'vitest';
import { ReviewEntryScroll } from '../src/content/review-entry-scroll';

it.each([false, true])('reveals once after native entry settles; never follows later moves (%s)', arrow => {
  vi.useFakeTimers();
  document.body.innerHTML = '<div id="charts"><div data-chesscom-vinf-review-graph="moved"></div></div><div class="game-controls-view-component"><div class="mobile-gr-footer-footer"><button class="mobile-gr-footer-primary" aria-label="Start Review">Start</button></div></div>';
  const button = document.querySelector('button')!;
  if (arrow) { button.className = ''; button.setAttribute('aria-label', 'Next Move'); button.parentElement!.setAttribute('data-chesscom-vinf-review-dock', ''); }
  let y = 0, bottom = 800;
  vi.spyOn(window, 'scrollY', 'get').mockImplementation(() => y);
  vi.spyOn(document.querySelector('#charts > div')!, 'getBoundingClientRect').mockImplementation(() => ({height:100,bottom:bottom-y} as DOMRect));
  vi.spyOn(document.querySelector('.mobile-gr-footer-footer')!, 'getBoundingClientRect').mockReturnValue({top:680} as DOMRect);
  const scroll = vi.spyOn(window, 'scrollBy').mockImplementation(options => { y += (options as ScrollToOptions).top!; });
  const clicks = vi.fn(); button.addEventListener('click', clicks);
  const entry = new ReviewEntryScroll(); entry.reconcile(document); button.click();
  if (!arrow) { vi.advanceTimersByTime(2500); expect(scroll).not.toHaveBeenCalled(); expect(clicks).toHaveBeenCalledTimes(1); button.setAttribute('aria-label', 'Next'); }
  vi.advanceTimersByTime(650); expect(y).toBe(128);
  bottom = 900; button.click(); vi.advanceTimersByTime(10000);
  expect(scroll).toHaveBeenCalledTimes(1);
  entry.cleanup(); vi.restoreAllMocks(); vi.useRealTimers();
});

it('cancels entry on manual scroll and never retries a native Start that has not advanced', () => {
  vi.useFakeTimers();
  document.body.innerHTML = '<div class="game-controls-view-component"><button class="mobile-gr-footer-primary" aria-label="Start Review"><svg data-glyph="move-circle-best"></svg></button></div>';
  const button = document.querySelector('button')!; const clicks = vi.fn(); button.addEventListener('click', clicks);
  const entry = new ReviewEntryScroll(); entry.reconcile(document); button.click();
  document.dispatchEvent(new Event('touchmove')); vi.advanceTimersByTime(11000);
  expect(clicks).toHaveBeenCalledTimes(1); expect(vi.getTimerCount()).toBe(0);
  entry.cleanup(); vi.restoreAllMocks(); vi.useRealTimers();
});

it('reveals a late report graph before Start Review and yields to later manual scrolling', () => {
  vi.useFakeTimers();
  document.body.innerHTML = '<div id="charts"></div><div class="game-controls-view-component"><div class="mobile-gr-footer-footer"><button aria-label="Start Review">Start</button></div></div>';
  const entry = new ReviewEntryScroll(); entry.reconcile(document);
  document.querySelector('#charts')!.innerHTML = '<div data-chesscom-vinf-review-graph="moved"></div>';
  vi.spyOn(document.querySelector('#charts > div')!, 'getBoundingClientRect').mockReturnValue({height:100,bottom:800} as DOMRect);
  vi.spyOn(document.querySelector('.mobile-gr-footer-footer')!, 'getBoundingClientRect').mockReturnValue({top:680} as DOMRect);
  const scroll = vi.spyOn(window, 'scrollBy').mockImplementation(() => {});
  entry.reconcile(document); vi.advanceTimersByTime(650);
  expect(scroll).toHaveBeenCalledWith({top:128, behavior:'instant'});
  entry.reconcile(document); vi.advanceTimersByTime(10000);
  expect(scroll).toHaveBeenCalledTimes(1);
  entry.cleanup();
  const cancelled = new ReviewEntryScroll(); cancelled.reconcile(document);
  document.dispatchEvent(new Event('wheel')); vi.advanceTimersByTime(1000);
  cancelled.reconcile(document); vi.advanceTimersByTime(1000);
  expect(scroll).toHaveBeenCalledTimes(1);
  cancelled.cleanup(); vi.restoreAllMocks(); vi.useRealTimers();
});
