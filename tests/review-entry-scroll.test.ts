import { expect, it, vi } from 'vitest';
import { ReviewEntryScroll } from '../src/content/review-entry-scroll';

it.each([false, true])('reveals a graph from primary or next-arrow entry (%s), follows late layout and yields to manual scroll', async arrow => {
  vi.useFakeTimers();
  document.body.innerHTML = '<div id="charts"><div data-chesscom-vinf-review-graph="moved"></div></div><div class="game-controls-view-component"><div class="mobile-gr-footer-footer"><button class="mobile-gr-footer-primary">Next</button></div></div>';
  const button = document.querySelector('button')!;
  if (arrow) {
    button.className = ''; button.setAttribute('aria-label', 'Next Move');
    button.parentElement!.setAttribute('data-chesscom-vinf-review-dock', '');
  }
  let y = 0, bottom = 800;
  vi.spyOn(window, 'scrollY', 'get').mockImplementation(() => y);
  vi.spyOn(document.querySelector('#charts > div')!, 'getBoundingClientRect').mockImplementation(() => ({height:100,bottom:bottom-y} as DOMRect));
  vi.spyOn(document.querySelector('.mobile-gr-footer-footer')!, 'getBoundingClientRect').mockReturnValue({top:680} as DOMRect);
  const scroll = vi.spyOn(window, 'scrollBy').mockImplementation(options => { y += (options as ScrollToOptions).top!; });
  const entry = new ReviewEntryScroll(); entry.reconcile(document);
  button.click(); await vi.advanceTimersByTimeAsync(500);
  expect(scroll).toHaveBeenCalledWith({top:128,behavior:'instant'});
  document.dispatchEvent(new Event('touchstart')); button.click(); bottom = 830;
  await vi.advanceTimersByTimeAsync(600); expect(y).toBe(158);
  document.dispatchEvent(new Event('touchmove')); bottom = 900;
  await vi.advanceTimersByTimeAsync(1000); expect(y).toBe(158);
  entry.cleanup(); vi.restoreAllMocks(); vi.useRealTimers();
});

it.each(['stalled', 'advanced', 'second tap', 'Next'])('guards a queued Start Review intent: %s', async mode => {
  vi.useFakeTimers();
  document.documentElement.removeAttribute('data-chesscom-vinf-review-clean');
  document.body.innerHTML = '<div class="mobile-top-section-container">Analyzing</div><wc-chess-board id="board-analysis-board"><div class="piece wp square-52"></div></wc-chess-board><div class="game-controls-view-component"><button class="mobile-gr-footer-primary" aria-label="Start Review"><svg data-glyph="move-circle-best"></svg></button></div>';
  const button = document.querySelector<HTMLButtonElement>('button')!;
  if (mode === 'Next') button.setAttribute('aria-label', 'Next');
  const click = vi.fn(); button.addEventListener('click', click);
  const entry = new ReviewEntryScroll(); entry.reconcile(document); button.click();
  await vi.advanceTimersByTimeAsync(500);
  document.querySelector('.mobile-top-section-container')!.textContent = 'Report ready';
  if (mode === 'advanced') document.querySelector('.piece')!.className = 'piece wp square-54';
  if (mode === 'second tap') button.click();
  await vi.advanceTimersByTimeAsync(9500);
  expect(click).toHaveBeenCalledTimes(mode === 'stalled' || mode === 'second tap' ? 2 : 1);
  entry.cleanup(); vi.restoreAllMocks(); vi.useRealTimers();
});
