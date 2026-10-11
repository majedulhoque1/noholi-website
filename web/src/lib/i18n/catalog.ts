// Catalog, search, book detail and library rules strings ("catalog.*").
// Add keys to BOTH `en` and `bn` (bn is typed to require every en key). Namespace keys, e.g. "catalog.someKey".
const en = {};

const bn: Record<keyof typeof en, string> = {};

export const catalog = { en, bn };
