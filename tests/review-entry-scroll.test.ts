import { expect, it, vi } from 'vitest';
import { ReviewEntryScroll } from '../src/content/review-entry-scroll';

it('reveals a settled graph once, yields to touch scrolling, and cleans pending work on departure', async () => {
  vi.useFakeTimers();
  document.body.innerHTML = '<div id="charts"><div data-chesscom-vinf-review-graph="moved"></div></div><div class="game-controls-view-component"><div class="mobile-gr-footer-footer"><button class="mobile-gr-footer-primary">Next</button></div></div>';
  const graph = document.querySelector<HTMLElement>('#charts > div')!;
  const footer = document.querySelector<HTMLElement>('.mobile-gr-footer-footer')!;
  const button = document.querySelector('button')!;
  vi.spyOn(graph, 'getBoundingClientRect').mockReturnValue({height:100,bottom:800} as DOMRect);
  vi.spyOn(footer, 'getBoundingClientRect').mockReturnValue({top:680} as DOMRect);
  const scroll = vi.spyOn(window, 'scrollBy').mockImplementation(() => {});
  const entry = new ReviewEntryScroll(); entry.reconcile(document);
  button.click(); await vi.advanceTimersByTimeAsync(350);
  expect(scroll).toHaveBeenCalledWith({top:128,behavior:'instant'});
  button.click(); await vi.advanceTimersByTimeAsync(350); expect(scroll).toHaveBeenCalledTimes(1);
  entry.cleanup(); entry.reconcile(document); button.click();
  document.dispatchEvent(new Event('touchstart')); await vi.advanceTimersByTimeAsync(350);
  expect(scroll).toHaveBeenCalledTimes(1);
  entry.cleanup(); entry.reconcile(document); button.click(); entry.cleanup();
  await vi.advanceTimersByTimeAsync(350); expect(scroll).toHaveBeenCalledTimes(1);
  vi.useRealTimers(); vi.restoreAllMocks();
});
