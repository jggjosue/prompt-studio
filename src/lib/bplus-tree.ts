/**
 * B+ Tree (orden fijo) para claves lexicográficas.
 * Búsqueda / inserción O(log n); rango y prefijo O(log n + k).
 * Misma familia de estructuras que usan MongoDB (WiredTiger) y PostgreSQL (B-Tree).
 */

const ORDER = 32;

type LeafNode<V> = {
  kind: 'leaf';
  keys: string[];
  values: V[];
  next: LeafNode<V> | null;
};

type InternalNode<V> = {
  kind: 'internal';
  keys: string[];
  children: BTreeNode<V>[];
};

type BTreeNode<V> = LeafNode<V> | InternalNode<V>;

function lowerBound(keys: string[], key: string): number {
  let lo = 0;
  let hi = keys.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (keys[mid]! < key) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

export class BPlusTree<V> {
  private root: BTreeNode<V>;
  private _size = 0;

  constructor() {
    this.root = this.createLeaf();
  }

  get size(): number {
    return this._size;
  }

  private createLeaf(): LeafNode<V> {
    return { kind: 'leaf', keys: [], values: [], next: null };
  }

  /** Búsqueda exacta O(log n). */
  search(key: string): V | undefined {
    const leaf = this.findLeaf(key);
    const i = lowerBound(leaf.keys, key);
    if (i < leaf.keys.length && leaf.keys[i] === key) {
      return leaf.values[i];
    }
    return undefined;
  }

  /** Inserta o reemplaza O(log n). */
  insert(key: string, value: V): void {
    const existed = this.search(key) !== undefined;
    const split = this.insertInto(this.root, key, value);
    if (split) {
      this.root = {
        kind: 'internal',
        keys: [split.key],
        children: [split.left, split.right],
      };
    }
    if (!existed) this._size++;
  }

  /**
   * Claves en [start, end] inclusive, ordenadas.
   * O(log n + k).
   */
  rangeSearch(start: string, end: string): Array<{ key: string; value: V }> {
    const out: Array<{ key: string; value: V }> = [];
    let leaf = this.findLeaf(start);
    let i = lowerBound(leaf.keys, start);

    while (leaf) {
      for (; i < leaf.keys.length; i++) {
        const k = leaf.keys[i]!;
        if (k > end) return out;
        out.push({ key: k, value: leaf.values[i]! });
      }
      leaf = leaf.next;
      i = 0;
    }
    return out;
  }

  /** Todas las claves con prefijo dado. O(log n + k). */
  prefixSearch(prefix: string): Array<{ key: string; value: V }> {
    if (!prefix) return this.scanAll();
    const end = prefix + '\uffff';
    return this.rangeSearch(prefix, end);
  }

  private scanAll(): Array<{ key: string; value: V }> {
    const out: Array<{ key: string; value: V }> = [];
    let leaf = this.leftmostLeaf();
    while (leaf) {
      for (let i = 0; i < leaf.keys.length; i++) {
        out.push({ key: leaf.keys[i]!, value: leaf.values[i]! });
      }
      leaf = leaf.next;
    }
    return out;
  }

  private leftmostLeaf(): LeafNode<V> {
    let node: BTreeNode<V> = this.root;
    while (node.kind === 'internal') {
      node = node.children[0]!;
    }
    return node;
  }

  private findLeaf(key: string): LeafNode<V> {
    let node: BTreeNode<V> = this.root;
    while (node.kind === 'internal') {
      let i = 0;
      while (i < node.keys.length && key >= node.keys[i]!) {
        i++;
      }
      node = node.children[i]!;
    }
    return node;
  }

  private insertInto(
    node: BTreeNode<V>,
    key: string,
    value: V
  ): { key: string; left: BTreeNode<V>; right: BTreeNode<V> } | null {
    if (node.kind === 'leaf') {
      const i = lowerBound(node.keys, key);
      if (i < node.keys.length && node.keys[i] === key) {
        node.values[i] = value;
        return null;
      }
      node.keys.splice(i, 0, key);
      node.values.splice(i, 0, value);
      if (node.keys.length < ORDER) return null;
      return this.splitLeaf(node);
    }

    let i = 0;
    while (i < node.keys.length && key >= node.keys[i]!) {
      i++;
    }
    const split = this.insertInto(node.children[i]!, key, value);
    if (!split) return null;

    node.keys.splice(i, 0, split.key);
    node.children.splice(i, 1, split.left, split.right);

    if (node.keys.length < ORDER) return null;

    const mid = Math.floor(node.keys.length / 2);
    const promote = node.keys[mid]!;
    const right: InternalNode<V> = {
      kind: 'internal',
      keys: node.keys.splice(mid + 1),
      children: node.children.splice(mid + 1),
    };
    node.keys.splice(mid);
    return { key: promote, left: node, right };
  }

  private splitLeaf(leaf: LeafNode<V>): {
    key: string;
    left: BTreeNode<V>;
    right: BTreeNode<V>;
  } {
    const mid = Math.ceil(leaf.keys.length / 2);
    const right: LeafNode<V> = {
      kind: 'leaf',
      keys: leaf.keys.splice(mid),
      values: leaf.values.splice(mid),
      next: leaf.next,
    };
    leaf.next = right;
    const promote = right.keys[0]!;
    return { key: promote, left: leaf, right };
  }
}
