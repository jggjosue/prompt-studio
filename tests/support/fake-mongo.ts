/**
 * In-memory stand-in for the Mongoose model statics the training pipeline uses.
 * It implements just enough query semantics (equality on dotted paths, $in,
 * $nin, $lt, $lte, $gt, $gte, $ne, $exists, $or, $setOnInsert/$set/$addToSet/$inc,
 * upsert, unique keys) to test capture, worker and release logic without a
 * database. Real index behaviour is covered by the e2e harness against MongoDB.
 */
type Doc = Record<string, unknown>;

function getPath(doc: Doc, path: string): unknown {
  return path.split('.').reduce<unknown>((value, key) => (value && typeof value === 'object' ? (value as Doc)[key] : undefined), doc);
}

function setPath(doc: Doc, path: string, value: unknown) {
  const keys = path.split('.');
  let target = doc;
  for (const key of keys.slice(0, -1)) {
    if (!target[key] || typeof target[key] !== 'object') target[key] = {};
    target = target[key] as Doc;
  }
  target[keys.at(-1)!] = value;
}

const clone = <T>(value: T): T => structuredClone(value);

function compare(a: unknown, b: unknown) {
  const left = a instanceof Date ? a.getTime() : a;
  const right = b instanceof Date ? b.getTime() : b;
  return (left as number) < (right as number) ? -1 : (left as number) > (right as number) ? 1 : 0;
}

function equals(a: unknown, b: unknown) {
  if (a instanceof Date || b instanceof Date) return compare(a, b) === 0 && a !== undefined && b !== undefined;
  if (Array.isArray(a) && !Array.isArray(b)) return a.some((item) => equals(item, b));
  return JSON.stringify(a) === JSON.stringify(b) || String(a) === String(b) && typeof a === typeof b;
}

function matchCondition(value: unknown, condition: unknown): boolean {
  if (condition && typeof condition === 'object' && !Array.isArray(condition) && !(condition instanceof Date)) {
    const ops = condition as Doc;
    if (Object.keys(ops).some((key) => key.startsWith('$'))) {
      return Object.entries(ops).every(([op, expected]) => {
        switch (op) {
          case '$in': return (expected as unknown[]).some((item) => (item === null ? value == null : equals(value, item)));
          case '$nin': return !(expected as unknown[]).some((item) => equals(value, item));
          case '$ne': return !equals(value, expected);
          case '$lt': return value != null && compare(value, expected) < 0;
          case '$lte': return value != null && compare(value, expected) <= 0;
          case '$gt': return value != null && compare(value, expected) > 0;
          case '$gte': return value != null && compare(value, expected) >= 0;
          case '$exists': return (value !== undefined) === Boolean(expected);
          default: throw new Error(`fake-mongo: unsupported operator ${op}`);
        }
      });
    }
  }
  if (condition === null) return value == null;
  return equals(value, condition);
}

export function matches(doc: Doc, filter: Doc = {}): boolean {
  return Object.entries(filter).every(([key, condition]) => {
    if (key === '$or') return (condition as Doc[]).some((sub) => matches(doc, sub));
    if (key === '$and') return (condition as Doc[]).every((sub) => matches(doc, sub));
    return matchCondition(getPath(doc, key), condition);
  });
}

function applyUpdate(doc: Doc, update: Doc, inserting: boolean) {
  const hasOperators = Object.keys(update).some((key) => key.startsWith('$'));
  if (!hasOperators) {
    for (const [path, value] of Object.entries(update)) setPath(doc, path, clone(value));
    return;
  }
  if (inserting && update.$setOnInsert) for (const [path, value] of Object.entries(update.$setOnInsert as Doc)) setPath(doc, path, clone(value));
  if (update.$set) for (const [path, value] of Object.entries(update.$set as Doc)) setPath(doc, path, clone(value));
  if (update.$unset) for (const path of Object.keys(update.$unset as Doc)) setPath(doc, path, undefined);
  if (update.$inc) for (const [path, value] of Object.entries(update.$inc as Doc)) setPath(doc, path, Number(getPath(doc, path) ?? 0) + Number(value));
  if (update.$addToSet) {
    for (const [path, value] of Object.entries(update.$addToSet as Doc)) {
      const list = (getPath(doc, path) as unknown[] | undefined) ?? [];
      const items = value && typeof value === 'object' && '$each' in (value as Doc) ? (value as { $each: unknown[] }).$each : [value];
      for (const item of items) if (!list.some((existing) => equals(existing, item))) list.push(item);
      setPath(doc, path, list);
    }
  }
}

class Query<T> implements PromiseLike<T> {
  private sortSpec: Doc | null = null;
  private limitValue: number | null = null;
  constructor(private readonly run: (sort: Doc | null, limit: number | null) => T) {}
  select() { return this; }
  sort(spec: Doc) { this.sortSpec = spec; return this; }
  limit(value: number) { this.limitValue = value; return this; }
  lean<R = T>() { return Promise.resolve(this.run(this.sortSpec, this.limitValue) as unknown as R); }
  exec() { return Promise.resolve(this.run(this.sortSpec, this.limitValue)); }
  then<A, B>(onFulfilled?: (value: T) => A | PromiseLike<A>, onRejected?: (reason: unknown) => B | PromiseLike<B>) {
    return this.exec().then(onFulfilled, onRejected);
  }
}

export class FakeCollection {
  docs: Doc[] = [];
  private seq = 0;
  constructor(private readonly uniqueKeys: string[][] = []) {}

  private assertUnique(candidate: Doc, ignore?: Doc) {
    for (const keys of this.uniqueKeys) {
      const clash = this.docs.find((doc) => doc !== ignore && keys.every((key) => equals(getPath(doc, key), getPath(candidate, key))));
      if (clash) throw Object.assign(new Error('E11000 duplicate key'), { code: 11000 });
    }
  }

  private sorted(docs: Doc[], sort: Doc | null) {
    if (!sort) return docs;
    return [...docs].sort((a, b) => {
      for (const [key, direction] of Object.entries(sort)) {
        const result = compare(getPath(a, key) ?? null, getPath(b, key) ?? null);
        if (result) return result * Number(direction);
      }
      return 0;
    });
  }

  insert(doc: Doc) {
    const value = { _id: doc._id ?? `fake${String(++this.seq).padStart(20, '0')}`, ...clone(doc) };
    this.assertUnique(value);
    this.docs.push(value);
    return clone(value);
  }

  find(filter: Doc = {}) {
    return new Query((sort, limit) => {
      const found = this.sorted(this.docs.filter((doc) => matches(doc, filter)), sort);
      return clone(limit === null ? found : found.slice(0, limit));
    });
  }

  findOne(filter: Doc = {}) {
    return new Query((sort) => {
      const found = this.sorted(this.docs.filter((doc) => matches(doc, filter)), sort)[0];
      return found ? clone(found) : null;
    });
  }

  async updateOne(filter: Doc, update: Doc, options: { upsert?: boolean } = {}) {
    const doc = this.docs.find((candidate) => matches(candidate, filter));
    if (doc) {
      const next = clone(doc);
      applyUpdate(next, update, false);
      this.assertUnique(next, doc);
      Object.assign(doc, next);
      return { matchedCount: 1, modifiedCount: 1, upsertedCount: 0 };
    }
    if (!options.upsert) return { matchedCount: 0, modifiedCount: 0, upsertedCount: 0 };
    const created: Doc = {};
    for (const [key, value] of Object.entries(filter)) if (!key.startsWith('$') && (typeof value !== 'object' || value === null)) setPath(created, key, value);
    applyUpdate(created, update, true);
    this.insert(created);
    return { matchedCount: 0, modifiedCount: 0, upsertedCount: 1 };
  }

  async updateMany(filter: Doc, update: Doc) {
    let modifiedCount = 0;
    for (const doc of this.docs.filter((candidate) => matches(candidate, filter))) {
      applyUpdate(doc, update, false);
      modifiedCount += 1;
    }
    return { matchedCount: modifiedCount, modifiedCount };
  }

  findOneAndUpdate(filter: Doc, update: Doc, options: { new?: boolean; returnDocument?: 'after' | 'before'; sort?: Doc } = {}) {
    // Mongoose returns a chainable query; the update runs once, when it is awaited or lean()ed.
    let result: { value: Doc | null } | null = null;
    return new Query(() => {
      if (result) return result.value;
      const doc = this.sorted(this.docs.filter((candidate) => matches(candidate, filter)), options.sort ?? null)[0];
      if (!doc) return (result = { value: null }).value;
      const before = clone(doc);
      applyUpdate(doc, update, false);
      return (result = { value: options.new || options.returnDocument === 'after' ? clone(doc) : before }).value;
    });
  }

  async exists(filter: Doc) {
    const doc = this.docs.find((candidate) => matches(candidate, filter));
    return doc ? { _id: doc._id } : null;
  }

  async countDocuments(filter: Doc = {}) {
    return this.docs.filter((doc) => matches(doc, filter)).length;
  }

  async deleteMany(filter: Doc = {}) {
    const before = this.docs.length;
    this.docs = this.docs.filter((doc) => !matches(doc, filter));
    return { deletedCount: before - this.docs.length };
  }

  async create(input: Doc | Doc[]) {
    return Array.isArray(input) ? input.map((doc) => this.insert(doc)) : this.insert(input);
  }
}

const PATCHED = ['find', 'findOne', 'updateOne', 'updateMany', 'findOneAndUpdate', 'exists', 'countDocuments', 'deleteMany', 'create'] as const;

/** Replaces a Mongoose model's statics with a FakeCollection. Returns a restore function. */
export function patchModel(model: unknown, collection: FakeCollection) {
  const target = model as Record<string, unknown>;
  const originals = Object.fromEntries(PATCHED.map((name) => [name, target[name]]));
  for (const name of PATCHED) target[name] = (collection[name] as (...args: unknown[]) => unknown).bind(collection);
  return () => Object.assign(target, originals);
}

/** Makes connectToDatabase() a no-op for tests. Call before importing modules that use it. */
export function fakeMongoConnection() {
  process.env.MONGODB_URI ||= 'mongodb://fake-host/test';
  (globalThis as Record<string, unknown>).mongoose = { conn: {}, promise: Promise.resolve({}) };
}
