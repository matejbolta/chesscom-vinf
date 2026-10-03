import { expect, it, vi } from 'vitest';
import { AnalysisRowActions } from '../src/content/analysis-row-actions';
it('places native action proxies at the board center and in the engine strip, forwards once and restores', () => {
  document.body.innerHTML='<wc-chess-board id="board-analysis-board"></wc-chess-board><div id="board-layout-player-bottom"><div class="player-component"></div></div><div class="sidebar-header-header"><button aria-label="Back">←</button><button aria-label="Settings">⚙</button></div><div class="analysis-options-bar"></div>';
  const board=document.querySelector<HTMLElement>('wc-chess-board')!;
  board.getBoundingClientRect=()=>({left:32,width:320} as DOMRect);
  document.querySelector<HTMLElement>('.player-component')!.getBoundingClientRect=()=>({left:0,width:390} as DOMRect);
  const native=document.querySelector<HTMLButtonElement>('[aria-label="Back"]')!;
  const clicked=vi.fn(); native.addEventListener('click',clicked);
  const controller=new AnalysisRowActions(); controller.reconcile(document,true); controller.reconcile(document,true);
  const proxies=document.querySelectorAll<HTMLButtonElement>('.chesscom-vinf-analysis-row-action');
  expect(proxies).toHaveLength(2); expect(proxies[0].style.left).toBe('192px'); expect(proxies[1].parentElement?.className).toBe('analysis-options-bar');
  proxies[0].click(); expect(clicked).toHaveBeenCalledOnce();
  const boardTab = vi.fn();
  document.querySelector<HTMLButtonElement>('.sidebar-header-header [aria-label="Settings"]')!.addEventListener('click',()=>{
    const dialog=document.createElement('div'); dialog.setAttribute('role','dialog');
    dialog.innerHTML='<div role="tablist"><button>Engine</button><button>Board</button></div>';
    dialog.querySelectorAll('button')[1].addEventListener('click',boardTab); document.body.append(dialog);
  });
  proxies[1].click(); expect(boardTab).toHaveBeenCalledOnce();
  controller.reconcile(document,true); expect(boardTab).toHaveBeenCalledOnce();

  board.classList.add('flipped'); controller.reconcile(document,true);
  expect(proxies[0].style.left).toBe('192px');
  controller.reconcile(document,false);
  expect(document.querySelector('.chesscom-vinf-analysis-row-action')).toBeNull();
  expect(native.hasAttribute('data-vinf-analysis-source')).toBe(false);
});
