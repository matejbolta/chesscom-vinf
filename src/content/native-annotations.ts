/** Narrow annotation-only surface observed in Chess.com's board component.
 * Never dispatch fabricated input or access move/state-machine methods. */
export interface NativeMark {
  key?: string;
  node?: boolean;
  persistent?: boolean;
  type: string;
  data: { square?: string; from?: string; to?: string; [key: string]: unknown };
}
export interface NativeMarkings {
  factory: {
    buildStandardAnalysisHighlight(square: string): NativeMark;
    buildStandardArrow(from: string, to: string): NativeMark;
  };
  addOne(mark: NativeMark): unknown;
  toggleOne(mark: NativeMark): unknown;
  getOne(key: string): NativeMark | undefined;
  removeOne(key: string): unknown;
}
export type AnnotationApiResolver = (board: HTMLElement) => NativeMarkings | null;

export function readNativeMarkings(board: unknown): NativeMarkings | null {
  try {
    const api = (board as { game?: { markings?: NativeMarkings } })?.game?.markings;
    return api && [api.addOne, api.toggleOne, api.getOne, api.removeOne,
      api.factory?.buildStandardArrow, api.factory?.buildStandardAnalysisHighlight]
      .every(fn => typeof fn === "function") ? api : null;
  } catch { return null; }
}

/** Returned factory objects stay in the page realm, including when called from
 * a userscript sandbox. Only strings cross into native factory/removal calls. */
export class NativeAnnotations {
  private readonly owned = new Map<string, NativeMark>();
  constructor(readonly api: NativeMarkings) {}

  private build(from: string, to: string): NativeMark {
    return from === to ? this.api.factory.buildStandardAnalysisHighlight(from)
      : this.api.factory.buildStandardArrow(from, to);
  }

  toggle(from: string, to: string): void {
    const key = this.api.toggleOne(this.build(from, to));
    if (typeof key === "string") this.remember(key);
  }

  private remember(key: string): void {
    const mark = this.api.getOne(key);
    if (mark) this.owned.set(key, mark);
  }

  private removeOwned(key: string): void {
    // Do not remove a replacement mark made by another native interaction.
    if (this.api.getOne(key) === this.owned.get(key) && this.owned.has(key)) {
      this.api.removeOne(key);
    }
    this.owned.delete(key);
  }

  clear(): void {
    for (const key of this.owned.keys()) this.removeOwned(key);
  }
}
