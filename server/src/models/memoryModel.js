import crypto from "crypto";

const collections = new Map();

function getCollection(name) {
  if (!collections.has(name)) collections.set(name, []);
  return collections.get(name);
}

function matchesValue(actual, expected) {
  if (expected && typeof expected === "object" && !(expected instanceof Date) && !Array.isArray(expected)) {
    if (expected.$regex) {
      const regex = new RegExp(expected.$regex, expected.$options || "i");
      return regex.test(String(actual ?? ""));
    }
    if (expected.$in) return expected.$in.includes(actual);
    if (expected.$eq !== undefined) return actual === expected.$eq;
    if (expected.$ne !== undefined) return actual !== expected.$ne;
    if (expected.$lt !== undefined) return actual < expected.$lt;
    if (expected.$lte !== undefined) return actual <= expected.$lte;
    if (expected.$gt !== undefined) return actual > expected.$gt;
    if (expected.$gte !== undefined) return actual >= expected.$gte;
  }
  return actual === expected;
}

function matchesQuery(record, query) {
  if (!query || Object.keys(query).length === 0) return true;
  for (const [key, value] of Object.entries(query)) {
    if (key === "$or") {
      if (!Array.isArray(value) || !value.some((clause) => matchesQuery(record, clause))) return false;
      continue;
    }
    if (key === "$and") {
      if (!Array.isArray(value) || !value.every((clause) => matchesQuery(record, clause))) return false;
      continue;
    }
    if (key === "_id") {
      const current = record._id?.toString?.() ?? record._id;
      if (!matchesValue(current, value && value.toString ? value.toString() : value)) return false;
      continue;
    }
    const current = record[key];
    if (current instanceof Date && value instanceof Date) {
      if (current.getTime() !== value.getTime()) return false;
      continue;
    }
    if (value && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)) {
      if (!matchesValue(current, value)) return false;
      continue;
    }
    if (current !== value) return false;
  }
  return true;
}

class MemoryQuery extends Array {
  constructor(items = []) {
    if (typeof items === "number") {
      super(items);
      return;
    }
    super(...items);
  }

  static get [Symbol.species]() {
    return Array;
  }
  sort(sortSpec) {
    const entries = Object.entries(sortSpec || {});
    if (entries.length === 0) return this;
    const sorted = [...this].sort((a, b) => {
      for (const [key, direction] of entries) {
        const left = a[key];
        const right = b[key];
        const result = left === right ? 0 : left > right ? 1 : -1;
        if (result !== 0) return direction === -1 ? -result : result;
      }
      return 0;
    });
    this.length = 0;
    sorted.forEach((item) => this.push(item));
    return this;
  }
  skip(count) {
    const skipped = [...this].slice(Number(count) || 0);
    this.length = 0;
    skipped.forEach((item) => this.push(item));
    return this;
  }
  limit(count) {
    const capped = [...this].slice(0, Number(count) || this.length);
    this.length = 0;
    capped.forEach((item) => this.push(item));
    return this;
  }
  toArray() { return [...this]; }
}

export function createMemoryModel(name, defaults = {}) {
  return class MemoryModel {
    static collectionName = name;

    static _documents() {
      return getCollection(name);
    }

    static async create(data = {}) {
      const item = {
        ...defaults,
        ...data,
        _id: data._id || crypto.randomUUID(),
        createdAt: data.createdAt || new Date(),
        updatedAt: data.updatedAt || new Date()
      };
      getCollection(name).push(item);
      return { ...item };
    }

    static find(query = {}) {
      const list = getCollection(name).filter((item) => matchesQuery(item, query));
      return new MemoryQuery(list);
    }

    static findOne(query = {}) {
      const item = getCollection(name).find((record) => matchesQuery(record, query));
      if (!item) return null;
      const wrapped = { ...item, select() { return this; } };
      return wrapped;
    }

    static async findById(id) {
      const item = getCollection(name).find((record) => record._id?.toString() === String(id));
      return item ? { ...item } : null;
    }

    static async countDocuments(query = {}) {
      return getCollection(name).filter((item) => matchesQuery(item, query)).length;
    }

    static async findOneAndUpdate(query, update = {}, options = {}) {
      const idx = getCollection(name).findIndex((item) => matchesQuery(item, query));
      if (idx === -1) return null;
      const existing = getCollection(name)[idx];
      const next = { ...existing, ...update, updatedAt: new Date() };
      getCollection(name)[idx] = next;
      if (options.new === false) return { ...existing };
      return { ...next };
    }

    static async findOneAndDelete(query) {
      const idx = getCollection(name).findIndex((item) => matchesQuery(item, query));
      if (idx === -1) return null;
      const [deleted] = getCollection(name).splice(idx, 1);
      return { ...deleted };
    }

    static clear() {
      collections.set(name, []);
    }
  };
}

export function getMemoryCollection(name) {
  return getCollection(name);
}

export function resetMemoryStore() {
  collections.clear();
}
