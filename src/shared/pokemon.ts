import names from "../../assets/pokemon/names.json";

export const PIECE_ROLES = ["p", "n", "b", "r", "q", "k"] as const;
export type PieceRole = typeof PIECE_ROLES[number];
export type PokemonPieces = Record<PieceRole, number>;
export const PIECE_NAMES: Record<PieceRole, string> = {
  p: "Pawn", n: "Knight", b: "Bishop", r: "Rook", q: "Queen", k: "King"
};
export const PIECE_GLYPHS: Record<PieceRole, string> = {
  p: "♟", n: "♞", b: "♝", r: "♜", q: "♛", k: "♚"
};
export const DEFAULT_POKEMON_PIECES: PokemonPieces = { p: 25, n: 78, b: 65, r: 143, q: 150, k: 149 };
export const POKEMON_CATALOG = Object.entries(names).map(([id, name]) => ({ id: Number(id), name }));
export function normalizePokemonPieces(value: unknown): PokemonPieces {
  const candidate = value && typeof value === "object" ? value as Partial<PokemonPieces> : {};
  return Object.fromEntries(PIECE_ROLES.map(role => {
    const id = candidate[role];
    return [role, typeof id === "number" && Number.isInteger(id) && id >= 1 && id <= 386
      ? id : DEFAULT_POKEMON_PIECES[role]];
  })) as PokemonPieces;
}
