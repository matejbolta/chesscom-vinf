import type { ExtensionSettings } from "./models";
import { DEFAULT_POKEMON_PIECES, PIECE_GLYPHS, PIECE_NAMES, PIECE_ROLES, POKEMON_CATALOG, type PokemonPieces } from "./pokemon";
import { pokemonSprite } from "./pokemon-art";

/** Shared desktop/Android editor; native selects remain keyboard/touch accessible. */
export function createPokemonEditor(document: Document, extremeInput: HTMLInputElement) {
  const section = document.createElement("section");
  section.className = "settings-card chesscom-vinf-settings-card vinf-pokemon-settings";
  section.setAttribute("aria-label", "Pokémon settings");
  const heading = document.createElement("h2"); heading.textContent = "Pokémon";
  const toggle = (text: string) => {
    const label = document.createElement("label"); label.className = "vinf-pokemon-toggle";
    const name = document.createElement("strong"); name.textContent = text;
    const input = document.createElement("input"); input.type = "checkbox"; input.setAttribute("role", "switch");
    label.append(name, input); return { label, input };
  };
  const mode = toggle("Pokémon mode");
  const pieces = toggle("Pokémon pieces");
  const note = document.createElement("p");
  note.textContent = "Poké Ball turns in play; your team in play and review. Turns off Extreme OLED.";
  const details = document.createElement("div");
  const grid = document.createElement("div"); grid.className = "vinf-pokemon-team";
  const selects = new Map<string, HTMLSelectElement>();
  const previews = new Map<string, HTMLImageElement>();
  for (const role of PIECE_ROLES) {
    const label = document.createElement("label"); label.className = "vinf-pokemon-choice";
    const name = document.createElement("span"); name.textContent = `${PIECE_GLYPHS[role]} ${PIECE_NAMES[role]}`;
    const image = document.createElement("img"); image.width = 48; image.height = 48; image.alt = "";
    const select = document.createElement("select"); select.setAttribute("aria-label", `${PIECE_NAMES[role]} Pokémon`);
    for (const pokemon of POKEMON_CATALOG) {
      const option = document.createElement("option"); option.value = String(pokemon.id);
      option.textContent = `${String(pokemon.id).padStart(3, "0")} · ${pokemon.name}`; select.append(option);
    }
    select.addEventListener("change", () => { image.src = pokemonSprite(Number(select.value)); });
    label.append(name, image, select); grid.append(label); selects.set(role, select); previews.set(role, image);
  }
  const legend = document.createElement("p");
  legend.textContent = "Light or dark badges show each team and chess role. Captured material keeps its chess symbols.";
  const reset = document.createElement("button"); reset.type = "button"; reset.textContent = "Reset team";
  function setTeam(team: PokemonPieces) {
    for (const role of PIECE_ROLES) {
      selects.get(role)!.value = String(team[role]); previews.get(role)!.src = pokemonSprite(team[role]);
    }
  }
  function refresh() {
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
  section.append(heading, mode.label, note, details);
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
