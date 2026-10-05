import { expect, it, vi } from "vitest";
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

it('moves below native sections that hydrate after the early document-start link', () => {
  document.documentElement.className = 'user-logged-in';
  document.body.replaceChildren();
  const controller = new HomeLink();
  const location = { protocol:'https:', hostname:'www.chess.com', pathname:'/game/123' };
  controller.reconcile(document, location, true, true);
  const link = document.querySelector('.chesscom-vinf-go-home');
  document.body.insertAdjacentHTML('beforeend', '<div id="board-layout-main"></div><aside id="board-layout-sidebar"></aside><div id="board-layout-comments"></div>');
  controller.reconcile(document, location, true, true);
  expect(document.body.lastElementChild).toBe(link);
  const mutations = vi.fn();
  const observer = new MutationObserver(mutations);
  observer.observe(document.body, { childList:true });
  controller.reconcile(document, location, true, true);
  expect(observer.takeRecords()).toHaveLength(0);
  observer.disconnect();
});
