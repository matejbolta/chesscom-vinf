import type { ExtensionSettings } from "./models";
import { DEFAULT_POKEMON_PIECES, PIECE_GLYPHS, PIECE_NAMES, PIECE_ROLES, POKEMON_CATALOG, type PokemonPieces } from "./pokemon";
import { pokemonSprite } from "./pokemon-art";

/** Shared desktop/Android editor with an inline searchable sprite picker. */
export function createPokemonEditor(document: Document, extremeInput: HTMLInputElement) {
  const section = document.createElement("section");
  section.className = "settings-card chesscom-vinf-settings-card vinf-pokemon-settings";
  section.setAttribute("aria-label", "Pokémon settings");
  const toggle = (text: string) => {
    const label = document.createElement("label"); label.className = "vinf-pokemon-toggle";
    const name = document.createElement("strong"); name.textContent = text;
    const input = document.createElement("input"); input.type = "checkbox"; input.setAttribute("role", "switch");
    label.append(name, input); return { label, input };
  };
  const mode = toggle("Pokémon mode");
  const pieces = toggle("Pokémon pieces");
  const note = document.createElement("p");
  note.textContent = "Turn indicator is a Poké Ball. Turns off Extreme OLED.";
  const details = document.createElement("div");
  const grid = document.createElement("div"); grid.className = "vinf-pokemon-team";
  const selects = new Map<string, HTMLSelectElement>();
  const previews = new Map<string, HTMLImageElement>();
  const triggers = new Map<string, HTMLButtonElement>();
  const picker = document.createElement("div"); picker.className = "vinf-pokemon-picker"; picker.hidden = true;
  const title = document.createElement("strong");
  const close = document.createElement("button"); close.type = "button"; close.textContent = "Close";
  const search = document.createElement("input"); search.type = "search"; search.placeholder = "Search name or number";
  search.setAttribute("aria-label", "Search Pokémon");
  const results = document.createElement("div"); results.className = "vinf-pokemon-results";
  const status = document.createElement("p"); status.setAttribute("role", "status");
  let activeRole: typeof PIECE_ROLES[number] | null = null;
  function dismiss() {
    const trigger = activeRole ? triggers.get(activeRole) : null;
    picker.hidden = true; trigger?.setAttribute("aria-expanded", "false"); activeRole = null; trigger?.focus();
  }
  function renderResults() {
    results.replaceChildren();
    const query = search.value.trim().toLowerCase();
    const matches = POKEMON_CATALOG.filter(p => `${String(p.id).padStart(3, "0")} ${p.name}`.toLowerCase().includes(query));
    for (const p of matches) {
      const option = document.createElement("button"); option.type = "button";
      const selected = activeRole !== null && selects.get(activeRole)?.value === String(p.id);
      option.setAttribute("aria-pressed", String(selected));
      const sprite = document.createElement("img"); sprite.src = pokemonSprite(p.id); sprite.alt = ""; sprite.width = 40; sprite.height = 40;
      const text = document.createElement("span"); text.textContent = `${String(p.id).padStart(3, "0")} · ${p.name}`;
      option.append(sprite, text);
      option.addEventListener("click", () => {
        if (!activeRole) return;
        const select = selects.get(activeRole)!; select.value = String(p.id);
        select.dispatchEvent(new Event("change", { bubbles: true })); dismiss();
      });
      results.append(option);
    }
    status.textContent = matches.length ? `${matches.length} Pokémon` : "No Pokémon found";
    results.scrollTop = 0;
  }
  close.addEventListener("click", dismiss);
  search.addEventListener("input", renderResults);
  picker.addEventListener("keydown", event => { if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); dismiss(); } });
  picker.append(title, close, search, status, results);
  for (const role of PIECE_ROLES) {
    const label = document.createElement("div"); label.className = "vinf-pokemon-choice";
    const name = document.createElement("span"); name.textContent = `${PIECE_GLYPHS[role]} ${PIECE_NAMES[role]}`;
    const image = document.createElement("img"); image.width = 48; image.height = 48; image.alt = "";
    const select = document.createElement("select"); select.setAttribute("aria-label", `${PIECE_NAMES[role]} Pokémon`);
    for (const pokemon of POKEMON_CATALOG) {
      const option = document.createElement("option"); option.value = String(pokemon.id);
      option.textContent = `${String(pokemon.id).padStart(3, "0")} · ${pokemon.name}`; select.append(option);
    }
    select.hidden = true;
    const trigger = document.createElement("button"); trigger.type = "button";
    trigger.setAttribute("aria-label", `${PIECE_NAMES[role]} Pokémon`); trigger.setAttribute("aria-expanded", "false");
    triggers.set(role, trigger);
    const update = () => { image.src = pokemonSprite(Number(select.value)); trigger.textContent = select.selectedOptions[0]?.textContent ?? "Choose Pokémon"; };
    select.addEventListener("change", update);
    trigger.addEventListener("click", () => {
      if (activeRole) triggers.get(activeRole)?.setAttribute("aria-expanded", "false");
      activeRole = role; title.textContent = `Choose ${PIECE_NAMES[role]} Pokémon`;
      trigger.setAttribute("aria-expanded", "true"); picker.hidden = false;
      label.after(picker); search.value = ""; renderResults(); search.focus();
    });
    label.append(name, image, select, trigger); grid.append(label); selects.set(role, select); previews.set(role, image);
  }
  const legend = document.createElement("p");
  legend.textContent = "Black’s Pokémon are nearly black; White’s keep their original colors. Captured material keeps its chess symbols.";
  const reset = document.createElement("button"); reset.type = "button"; reset.textContent = "Reset team";
  function setTeam(team: PokemonPieces) {
    for (const role of PIECE_ROLES) {
      selects.get(role)!.value = String(team[role]); triggers.get(role)!.textContent = selects.get(role)!.selectedOptions[0]?.textContent ?? "Choose Pokémon"; previews.get(role)!.src = pokemonSprite(team[role]);
    }
  }
  function refresh() {
    if ((!mode.input.checked || !pieces.input.checked) && activeRole) dismiss();
    details.hidden = !mode.input.checked;
    grid.hidden = !pieces.input.checked;
    reset.hidden = !pieces.input.checked;
    legend.hidden = !pieces.input.checked;
  }
  mode.input.addEventListener("change", () => {
    if (mode.input.checked) extremeInput.checked = false;
    refresh();
  });
  extremeInput.addEventListener("change", () => {
    if (extremeInput.checked) mode.input.checked = false;
    refresh();
  });
  pieces.input.addEventListener("change", refresh);
  reset.addEventListener("click", () => {
    setTeam(DEFAULT_POKEMON_PIECES);
    reset.dispatchEvent(new Event("change", { bubbles: true }));
  });
  details.append(pieces.label, grid, legend, reset);
  section.append(mode.label, note, details);
  return {
    element: section,
    set(settings: ExtensionSettings) {
      mode.input.checked = settings.pokemonMode; pieces.input.checked = settings.pokemonPiecesEnabled;
      setTeam(settings.pokemonPieces); refresh();
    },
    get() {
      return { pokemonMode: mode.input.checked, pokemonPiecesEnabled: pieces.input.checked,
        pokemonPieces: Object.fromEntries(PIECE_ROLES.map(role => [role, Number(selects.get(role)!.value)])) as PokemonPieces };
    }
  };
}
