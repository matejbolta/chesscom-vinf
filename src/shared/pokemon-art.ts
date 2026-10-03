import sprites from "../../assets/pokemon/sprites.json";
/** Bundled PNGs only: no runtime fetch or user-supplied URLs. See assets/pokemon. */
export function pokemonSprite(id: number): string {
  return (sprites as Record<string, string>)[id] ?? sprites[25];
}
