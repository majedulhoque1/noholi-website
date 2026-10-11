// Borrow request, requests, loans and fines strings ("lending.*").
// Add keys to BOTH `en` and `bn` (bn is typed to require every en key). Namespace keys, e.g. "lending.someKey".
const en = {};

const bn: Record<keyof typeof en, string> = {};

export const lending = { en, bn };
