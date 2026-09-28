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
  private preview: string | null = null;
  private readonly previewKey = `vinf-touch-preview-${crypto.randomUUID()}`;
  constructor(readonly api: NativeMarkings) {}

  private build(from: string, to: string): NativeMark {
    return from === to ? this.api.factory.buildStandardAnalysisHighlight(from)
      : this.api.factory.buildStandardArrow(from, to);
  }

  showPreview(from: string, to: string): void {
    this.clearPreview();
    // Native highlights are pooled by square; a second temporary highlight can
    // otherwise remove an existing square's visual when the preview is cleared.
    if (from === to) return;
    const mark = this.build(from, to);
    // This is the native default key contract. Do not overlay a duplicate arrow.
    if (this.api.getOne(mark.key ?? `${mark.type}|${from}${to}`)) return;
    mark.key = this.previewKey;
    mark.persistent = false;
    const key = this.api.addOne(mark);
    if (typeof key === "string") { this.remember(key); this.preview = key; }
  }

  toggle(from: string, to: string): void {
    this.clearPreview();
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

  clearPreview(): void {
    if (this.preview) this.removeOwned(this.preview);
    this.preview = null;
  }

  clear(): void {
    for (const key of this.owned.keys()) this.removeOwned(key);
    this.preview = null;
  }
}
