/** Ignore paint-only work after gameplay has mounted. Structural hydration,
 * board replacement, unsupported canvas and game-result changes still reconcile. */
export function mutationElement(record: MutationRecord): Element | null {
  return record.target.nodeType === 1 ? record.target as Element : record.target.parentElement;
}
export function isOwnedGameMutation(record: MutationRecord): boolean {
  return !!mutationElement(record)?.closest('[data-chesscom-vinf-owned], .chesscom-vinf-extreme-scroll-room');
}
export function hasGamePresentation(document: Document): boolean {
  return document.documentElement.hasAttribute('data-chesscom-vinf-normal-clocks') ||
    document.documentElement.hasAttribute('data-chesscom-vinf-extreme-oled');
}
export function isBoardPaintMutation(record: MutationRecord): boolean {
  const board = mutationElement(record)?.closest('wc-chess-board#board-single');
  if (record.type === 'attributes' && record.target === board) return false;
  if (!board || !hasGamePresentation(board.ownerDocument) || !board.querySelector('.piece')) return false;
  // Unsupported renderer changes must still tear down the overlays.
  return !board.querySelector('canvas');
}
export function isClockTextMutation(record: MutationRecord): boolean {
  if (!mutationElement(record)?.closest('.clock-component')) return false;
  return record.type === 'characterData' || (record.type === 'childList' &&
    [...record.addedNodes, ...record.removedNodes].every(node => node.nodeType === 3));
}
