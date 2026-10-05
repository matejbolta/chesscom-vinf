import { readFileSync } from "node:fs";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { PokemonController } from "../src/content/pokemon-controller";
import { ExtremeOledController } from "../src/content/extreme-oled-controller";
import { DEFAULT_SETTINGS, normalizeSettings } from "../src/shared/settings";
import { createPokemonEditor } from "../src/shared/pokemon-editor";
import { POKEMON_CATALOG } from "../src/shared/pokemon";
import { pokemonSprite } from "../src/shared/pokemon-art";

const location = { protocol: "https:", hostname: "www.chess.com", pathname: "/game/123456" };
const settings = { ...DEFAULT_SETTINGS, pokemonMode: true };
const originalAnimate = HTMLElement.prototype.animate;
let skin: PokemonController;
let clocks: ExtremeOledController;
beforeEach(() => {
  vi.useFakeTimers();
  document.documentElement.innerHTML = readFileSync("tests/fixtures/phone-game.html", "utf8");
  document.documentElement.className = "user-logged-in";
  skin = new PokemonController(); clocks = new ExtremeOledController();
});
afterEach(() => {
  skin.cleanup(document); clocks.cleanup(document); vi.restoreAllMocks(); vi.unstubAllGlobals();
  if (originalAnimate) HTMLElement.prototype.animate = originalAnimate;
  else delete (HTMLElement.prototype as {animate?: unknown}).animate;
  vi.clearAllTimers(); vi.useRealTimers();
});

it("validates the complete Gen I catalog and conflicting settings without aliasing defaults", () => {
  expect(POKEMON_CATALOG).toHaveLength(151);
  for (const { id } of POKEMON_CATALOG) expect(pokemonSprite(id)).toMatch(/^data:image\/png;base64,iVBOR/);
  expect(new Set(POKEMON_CATALOG.map(({id}) => pokemonSprite(id))).size).toBe(151);
  const normalized = normalizeSettings({ pokemonMode: true, extremeOled: true, pokemonPieces: {p:151,n:152,b:1.2,r:"9"} });
  expect(normalized.pokemonMode).toBe(false);
  expect(normalized.pokemonPieces).toEqual({...DEFAULT_SETTINGS.pokemonPieces,p:151});
  normalized.pokemonPieces.p = 1;
  expect(DEFAULT_SETTINGS.pokemonPieces.p).toBe(25);
});

it("preserves native piece nodes, styles, input and promotion classes; restores on disable, route exit and Extreme", () => {
  const board = document.querySelector<HTMLElement>('wc-chess-board')!;
  const piece = board.querySelector<HTMLElement>('.wp')!;
  const original = board.outerHTML;
  const input = vi.fn(); piece.addEventListener('pointerdown', input);
  skin.reconcile(document, location, settings);
  const style = document.querySelector('[data-chesscom-vinf-owned="pokemon-pieces"]');
  skin.reconcile(document, location, settings);
  expect(document.querySelectorAll('[data-chesscom-vinf-owned="pokemon-pieces"]')).toHaveLength(1);
  expect(document.querySelector('[data-chesscom-vinf-owned="pokemon-pieces"]')).toBe(style);
  piece.dispatchEvent(new Event('pointerdown',{bubbles:true})); expect(input).toHaveBeenCalledOnce();
  piece.classList.replace('wp','wq');
  expect(style?.textContent).toContain('.wq,.bq');
  expect(style?.textContent).toContain(pokemonSprite(settings.pokemonPieces.q));
  piece.classList.replace('wq','wp');
  for (const next of [{...settings, enabled:false},{...settings,extremeOled:true}]) {
    skin.reconcile(document, location, next);
    expect(board.outerHTML).toBe(original);
    expect(document.querySelector('[data-chesscom-vinf-owned="pokemon-pieces"]')).toBeNull();
    skin.reconcile(document, location, settings);
  }
  skin.reconcile(document, {...location,pathname:'/home'}, settings);
  expect(board.outerHTML).toBe(original);
  skin.reconcile(document, location, {...settings,pokemonPiecesEnabled:false});
  expect(board.hasAttribute('data-chesscom-vinf-pokemon-board')).toBe(false);
});

it("skins Review's audited board without adding live clocks, and ignores unsupported canvas boards", () => {
  const board = document.querySelector<HTMLElement>('wc-chess-board')!;
  board.id = 'board-analysis-board';
  skin.reconcile(document,{...location,pathname:'/analysis/game/live/123456/review'},settings);
  expect(board.hasAttribute('data-chesscom-vinf-pokemon-board')).toBe(true);
  expect(document.querySelector('.chesscom-vinf-extreme-controls')).toBeNull();
  board.append(document.createElement('canvas'));
  skin.reconcile(document,{...location,pathname:'/analysis/game/live/123456/review'},settings);
  expect(document.documentElement.hasAttribute('data-chesscom-vinf-pokemon')).toBe(false);
});

it("shares mode exclusivity, team selection, preview and reset across settings surfaces", () => {
  const extreme = document.createElement('input'); extreme.type = 'checkbox';
  const editor = createPokemonEditor(document, extreme);
  document.body.append(extreme, editor.element); editor.set(settings);
  const mode = editor.element.querySelector<HTMLInputElement>('input')!;
  extreme.checked = true; extreme.dispatchEvent(new Event('change'));
  expect(editor.get().pokemonMode).toBe(false);
  mode.checked = true; mode.dispatchEvent(new Event('change'));
  expect(extreme.checked).toBe(false);
  const pawn = editor.element.querySelector<HTMLSelectElement>('[aria-label="Pawn Pokémon"]')!;
  expect(pawn.options).toHaveLength(151);
  pawn.value = '133'; pawn.dispatchEvent(new Event('change'));
  expect(editor.get().pokemonPieces.p).toBe(133);
  expect(editor.element.querySelector('img')?.src).toBe(pokemonSprite(133));
  Array.from(editor.element.querySelectorAll<HTMLButtonElement>('button')).find(button => button.textContent === "Reset team")!.click();
  expect(editor.get().pokemonPieces).toEqual(DEFAULT_SETTINGS.pokemonPieces);
});

it.each([false, true])("opens the ball once for a completed move (first move: %s), never on mount or clock ticks", async firstMove => {
  if (firstMove) document.querySelector("wc-simple-move-list > div")!.replaceChildren();
  const animate = vi.fn(() => ({cancel:vi.fn()}) as unknown as Animation);
  vi.stubGlobal('matchMedia', () => ({matches:false}));
  HTMLElement.prototype.animate = animate;
  clocks.reconcile(document, location, settings, true);
  expect(animate).not.toHaveBeenCalled();
  const top = document.querySelector('#board-layout-player-top .clock-component')!;
  const bottom = document.querySelector('#board-layout-player-bottom .clock-component')!;
  top.classList.add('clock-player-turn'); bottom.classList.remove('clock-player-turn');
  document.querySelector('wc-simple-move-list > div')!.insertAdjacentHTML('beforeend',
    '<div class="main-line-row"><div class="node white-move main-line-ply" data-node="0-40">Nf3</div></div>');
  await vi.advanceTimersByTimeAsync(20);
  const last = document.querySelector('.chesscom-vinf-last-move.bottom')!;
  expect(last.textContent).toBe('Nf3'); expect(last.hasAttribute('hidden')).toBe(false);
  expect(animate).toHaveBeenCalledTimes(4); // New player's pulse + label and two opening halves.
  document.querySelector('#board-layout-player-top [role="timer"]')!.textContent = '9:59';
  await vi.advanceTimersByTimeAsync(20);
  clocks.reconcile(document, location, settings, true);
  expect(animate).toHaveBeenCalledTimes(4);
  clocks.cleanup(document);
  clocks.reconcile(document, location, {...settings,extremeOled:true}, true);
  expect(document.querySelector('[data-pokemon]')).toBeNull();
});

it("keeps the Pokemon skin through Review to engine Analysis and cleans up on unrelated analysis", () => {
  const board = document.querySelector<HTMLElement>('wc-chess-board')!;
  board.id = 'board-analysis-board';
  skin.reconcile(document, {...location, pathname:'/analysis/game/live/123456/review'}, settings);
  const style = document.querySelector('[data-chesscom-vinf-owned="pokemon-pieces"]');
  skin.reconcile(document, {...location, pathname:'/analysis/game/live/123456/analysis'}, settings);
  expect(board.hasAttribute('data-chesscom-vinf-pokemon-board')).toBe(true);
  expect(document.querySelector('[data-chesscom-vinf-owned="pokemon-pieces"]')).toBe(style);
  expect(document.querySelector('.chesscom-vinf-extreme-controls')).toBeNull();
  skin.reconcile(document, {...location, pathname:'/analysis'}, settings);
  expect(board.hasAttribute('data-chesscom-vinf-pokemon-board')).toBe(false);
});

it("searches sprite choices, saves selection and restores trigger focus", () => {
  const extreme = document.createElement('input'); extreme.type = 'checkbox';
  const editor = createPokemonEditor(document, extreme); document.body.append(editor.element); editor.set(settings);
  const trigger = editor.element.querySelector<HTMLButtonElement>('button[aria-label="Pawn Pokémon"]')!;
  trigger.click();
  const search = editor.element.querySelector<HTMLInputElement>('input[type="search"]')!;
  search.value = 'eevee'; search.dispatchEvent(new Event('input'));
  const options = editor.element.querySelectorAll<HTMLButtonElement>('.vinf-pokemon-results button');
  expect(options).toHaveLength(1); expect(options[0].querySelector('img')?.src).toBe(pokemonSprite(133));
  const changed = vi.fn(); editor.element.addEventListener('change', changed);
  options[0].click(); expect(editor.get().pokemonPieces.p).toBe(133); expect(changed).toHaveBeenCalledOnce();
  expect(document.activeElement).toBe(trigger); expect(trigger.getAttribute('aria-expanded')).toBe('false');
  trigger.click(); search.value = 'not-a-pokemon'; search.dispatchEvent(new Event('input'));
  expect(editor.element.querySelector('[role="status"]')?.textContent).toBe('No Pokémon found');
  search.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  expect(document.activeElement).toBe(trigger);
});
