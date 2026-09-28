import type { NativeMark, NativeMarkings } from "../../src/content/native-annotations";

/** Sanitized contract fixture, NOT Chess.com's implementation. Geometry is only
 * illustrative; native renderer integration needs independent source/device evidence. */
export function installAnnotationFixture(board: HTMLElement): NativeMarkings {
  const marks = new Map<string, NativeMark>();
  const elements = new Map<string, Element>();
  const ns = "http://www.w3.org/2000/svg";
  const arrows = document.createElementNS(ns, "svg");
  arrows.setAttribute("viewBox", "0 0 100 100");
  arrows.classList.add("arrows");
  Object.assign(arrows.style, { position: "absolute", inset: "0", width: "100%", height: "100%", pointerEvents: "none" });
  board.append(arrows);
  const coords = (square: string) => {
    const flipped = board.classList.contains("flipped");
    const x = square.charCodeAt(0) - 97, y = 8 - Number(square[1]);
    return [(flipped ? 7 - x : x) * 12.5 + 6.25, (flipped ? 7 - y : y) * 12.5 + 6.25];
  };
  const api: NativeMarkings = {
    factory: {
      buildStandardAnalysisHighlight: square => ({ type: "highlight", node: true, persistent: false, data: { square, keyPressed: "none", opacity: .8 } }),
      buildStandardArrow: (from, to) => ({ type: "arrow", node: true, persistent: false, data: { from, to, keyPressed: "none", opacity: .8 } })
    },
    getOne: key => marks.get(key),
    removeOne: key => { elements.get(key)?.remove(); elements.delete(key); return marks.delete(key); },
    addOne: mark => {
      const key = mark.key ?? `${mark.type}|${mark.data.square ?? `${mark.data.from}${mark.data.to}`}`;
      api.removeOne(key);
      marks.set(key, { ...mark, key });
      let el: Element;
      if (mark.data.square) {
        const [x, y] = coords(mark.data.square);
        const square = document.createElement("div");
        square.className = "highlight";
        Object.assign(square.style, { position: "absolute", left: `${x - 6.25}%`, top: `${y - 6.25}%`, width: "12.5%", height: "12.5%", backgroundColor: "rgb(235, 97, 80)", opacity: ".8", pointerEvents: "none" });
        board.append(square); el = square;
      } else {
        const [x, y] = coords(mark.data.from!), [ex, ey] = coords(mark.data.to!);
        const path = document.createElementNS(ns, "path");
        path.classList.add("arrow");
        // Representative L-shaped knight path; production never uses this helper.
        const knight = [Math.abs(ex-x), Math.abs(ey-y)].sort((a,b)=>a-b).join() === "12.5,25";
        const bx = knight ? (Math.abs(ex-x) > Math.abs(ey-y) ? ex : x) : x;
        const by = knight ? (Math.abs(ex-x) > Math.abs(ey-y) ? y : ey) : y;
        path.setAttribute("d", `M${x} ${y} L${bx} ${by} L${ex} ${ey}`);
        path.setAttribute("stroke", "#e99b24"); path.setAttribute("stroke-width", "2.5"); path.setAttribute("fill", "none");
        arrows.append(path); el = path;
      }
      elements.set(key, el); return key;
    },
    toggleOne: mark => {
      const key = mark.key ?? `${mark.type}|${mark.data.square ?? `${mark.data.from}${mark.data.to}`}`;
      return marks.has(key) ? api.removeOne(key) : api.addOne(mark);
    }
  };
  Object.assign(board, { game: { markings: api } });
  return api;
}
