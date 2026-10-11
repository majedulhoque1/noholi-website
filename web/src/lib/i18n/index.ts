import { core } from "./core";
import { auth } from "./auth";
import { catalog } from "./catalog";
import { lending } from "./lending";
import { forms } from "./forms";

export type Lang = "en" | "bn";

/**
 * Merged dictionaries. To add keys: edit the module for your area (core/auth/catalog/lending/forms),
 * adding the key to BOTH `en` and `bn`. Keys must be unique across modules (namespace them,
 * e.g. "lending.dueOn"); a duplicate silently takes the later module, so grep before adding.
 */
export const dict = {
  en: { ...core.en, ...auth.en, ...catalog.en, ...lending.en, ...forms.en },
  bn: { ...core.bn, ...auth.bn, ...catalog.bn, ...lending.bn, ...forms.bn },
};

export type TKey = keyof typeof dict.en;
export type TVars = Record<string, string | number>;

function interpolate(str: string, vars?: TVars) {
  if (!vars) return str;
  return str.replace(/\{(\w+)\}/g, (m, k: string) => (Object.prototype.hasOwnProperty.call(vars, k) ? String(vars[k]) : m));
}

/** Translate for a given language, falling back to English. */
export function translateFor(lang: Lang, key: TKey, vars?: TVars): string {
  const table = dict[lang] as Record<string, string>;
  const fallback = dict.en as Record<string, string>;
  return interpolate(table[key] ?? fallback[key] ?? key, vars);
}

// Mirrors the active language for translate(), which has no access to React context.
let currentLang: Lang = "en";

/** Called by the app store whenever the language changes. */
export function setActiveLang(lang: Lang) {
  currentLang = lang;
}

/**
 * For code that runs outside React (lib/supabase.ts, lib/auth.tsx). Reads the language active
 * right now, so call it inside a function body, never at module load.
 */
export function translate(key: TKey, vars?: TVars): string {
  return translateFor(currentLang, key, vars);
}
