// Join, contact, privacy and coming-soon strings ("forms.*").
// Add keys to BOTH `en` and `bn` (bn is typed to require every en key). Namespace keys, e.g. "forms.someKey".
const en = {};

const bn: Record<keyof typeof en, string> = {};

export const forms = { en, bn };
