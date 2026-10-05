import { expect, it } from "vitest";
import { HomeLink } from "../src/content/home-link";

it('keeps one native home link before the footer across all phone game/review phases and restores on departure', () => {
  document.documentElement.className = 'user-logged-in';
  document.body.innerHTML = '<main>Native content</main><footer>Footer</footer>';
  const controller = new HomeLink();
  const location = { protocol: 'https:', hostname: 'www.chess.com', pathname: '/game/123' };
  for (const pathname of ['/game/123', '/play/online/new', '/analysis/game/live/123', '/analysis/game/live/123/review', '/analysis/game/live/123/analysis']) {
    controller.reconcile(document, {...location, pathname}, true, true);
    controller.reconcile(document, {...location, pathname}, true, true);
    expect(document.querySelectorAll('.chesscom-vinf-go-home')).toHaveLength(1);
    const link = document.querySelector<HTMLAnchorElement>('.chesscom-vinf-go-home')!;
    expect(link.href).toBe('https://www.chess.com/home');
    expect(link.nextElementSibling?.tagName).toBe('FOOTER');
  }
  controller.reconcile(document, location, true, false);
  expect(document.querySelector('.chesscom-vinf-go-home')).toBeNull();
  controller.reconcile(document, {...location, pathname:'/home'}, true, true);
  expect(document.querySelector('.chesscom-vinf-go-home')).toBeNull();
  document.querySelector('footer')!.remove();
  controller.reconcile(document, location, true, true);
  expect(document.body.lastElementChild?.textContent).toBe('Go home');
  controller.reconcile(document, location, false, true);
  expect(document.querySelector('.chesscom-vinf-go-home')).toBeNull();
});
