import { expect, it, vi } from 'vitest';
import { ReviewDock } from '../src/content/review-dock';

it('keeps native Start/Next nodes and handlers, supports optional controls, fails open, and restores', () => {
  document.body.innerHTML = '<div class="game-controls-view-component"><div class="mobile-gr-footer-footer"><div class="mobile-gr-footer-group-start"><button aria-label="Explain"></button></div><button class="mobile-gr-footer-primary" aria-label="Start Review"></button><div class="mobile-gr-footer-group-end"><button aria-label="Previous Move" disabled></button><button aria-label="Next Move"></button></div></div></div>';
  const dock = document.querySelector<HTMLElement>('.mobile-gr-footer-footer')!;
  const start = dock.querySelector<HTMLButtonElement>('[aria-label="Start Review"]')!;
  const next = dock.querySelector<HTMLButtonElement>('[aria-label="Next Move"]')!;
  const startClick = vi.fn(), nextClick = vi.fn();
  start.addEventListener('click', startClick); next.addEventListener('click', nextClick);
  const controller = new ReviewDock(); controller.reconcile(document);
  expect(dock.hasAttribute('data-chesscom-vinf-review-dock')).toBe(true);
  start.click(); expect(startClick).toHaveBeenCalledTimes(1); expect(nextClick).not.toHaveBeenCalled();
  start.setAttribute('aria-label', 'Next'); controller.reconcile(document);
  next.click(); expect(nextClick).toHaveBeenCalledTimes(1);
  expect(dock.querySelector('[aria-label="Previous Move"]')!.hasAttribute('disabled')).toBe(true);
  dock.querySelector('[aria-label="Explain"]')!.remove();
  dock.firstElementChild!.insertAdjacentHTML('beforeend', '<button aria-label="Best"></button>');
  controller.reconcile(document); expect(dock.hasAttribute('data-chesscom-vinf-review-dock')).toBe(true);
  dock.firstElementChild!.insertAdjacentHTML('beforeend', '<button aria-label="Hint" disabled></button>');
  controller.reconcile(document); expect(dock.hasAttribute('data-chesscom-vinf-review-dock')).toBe(true);
  start.setAttribute('aria-label', 'Resume'); controller.reconcile(document);
  expect(dock.hasAttribute('data-chesscom-vinf-review-dock')).toBe(true);
  start.setAttribute('aria-label', 'Unknown native action'); controller.reconcile(document);
  expect(dock.hasAttribute('data-chesscom-vinf-review-dock')).toBe(false);
  start.setAttribute('aria-label', 'Next'); controller.reconcile(document); controller.cleanup();
  expect(dock.hasAttribute('data-chesscom-vinf-review-dock')).toBe(false);
  expect(dock.querySelector('[aria-label="Next Move"]')).toBe(next);
});
