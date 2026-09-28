/** Use the site's positioned board container so compositor scrolling carries the
 * board and owned overlays together. Never change the board/host geometry. */
export function boardOverlayHost(board: HTMLElement): HTMLElement {
  const document = board.ownerDocument;
  const stage = board.closest<HTMLElement>("#board-layout-chessboard");
  const position = stage && document.defaultView?.getComputedStyle(stage).position;
  return stage && position && position !== "static" ? stage : document.body;
}

export function placeBoardOverlay(element: HTMLElement | SVGSVGElement, host: HTMLElement,
  rect: Pick<DOMRect, "left" | "top" | "width" | "height">): void {
  if (element.parentElement !== host) host.append(element);
  const anchored = host !== host.ownerDocument.body;
  const origin = anchored ? host.getBoundingClientRect() : null;
  const styles = {
    position: anchored ? "absolute" : "fixed",
    left: `${rect.left - (origin ? origin.left + host.clientLeft - host.scrollLeft : 0)}px`,
    top: `${rect.top - (origin ? origin.top + host.clientTop - host.scrollTop : 0)}px`,
    width: `${rect.width}px`, height: `${rect.height}px`
  };
  for (const [property, value] of Object.entries(styles)) {
    if (element.style.getPropertyValue(property) !== value) element.style.setProperty(property, value);
  }
}
