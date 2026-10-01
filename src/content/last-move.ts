const LIST = 'wc-simple-move-list[board-id="board-single"]';
export interface LastMove { notation: string; color: "white" | "black" }

/** Read the native main line, never the selected analysis node or timestamps. */
export class LastMoveReader {
  private list: Element | null = null;
  private dirty = true;
  private value: LastMove | null = null;

  invalidate(records: MutationRecord[]): void {
    if (records.some(record => {
      const element = record.target.nodeType === 1 ? record.target as Element : record.target.parentElement;
      return !!element?.closest(LIST);
    })) this.dirty = true;
  }

  read(document: Document): LastMove | null {
    const list = document.querySelector(LIST);
    if (list !== this.list) { this.list = list; this.dirty = true; }
    if (!this.dirty) return this.value;
    this.dirty = false;
    this.value = null;
    let latest: Element | null = null;
    let lastPly = -1;
    for (const node of list?.querySelectorAll('.main-line-row > .node.main-line-ply[data-node]') ?? []) {
      const match = /^0-(\d+)$/.exec(node.getAttribute('data-node') ?? '');
      if (match && Number(match[1]) > lastPly) { latest = node; lastPly = Number(match[1]); }
    }
    if (!latest) return null;
    const color = latest.classList.contains('white-move') ? 'white' : latest.classList.contains('black-move') ? 'black' : null;
    // Figurine mode stores the piece letter in data-figurine, outside textContent.
    const text = (node: Node): string => {
      if (node.nodeType === 3) return node.textContent ?? '';
      if (node.nodeType !== 1) return '';
      const piece = (node as Element).getAttribute('data-figurine');
      return piece ?? [...node.childNodes].map(text).join('');
    };
    const notation = text(latest.querySelector('.node-highlight-content') ?? latest).replace(/\s/g, '').replace(/[!?]+$/, '');
    if (color && /^(?:[KQRBN]?[a-h]?[1-8]?x?[a-h][1-8](?:=[QRBN])?|O-O(?:-O)?)[+#]?$/.test(notation)) {
      this.value = { notation, color };
    }
    return this.value;
  }

  reset(): void { this.list = null; this.value = null; this.dirty = true; }
}
