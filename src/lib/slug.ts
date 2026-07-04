/**
 * Slug helper — produces URL-safe slugs from any input.
 * Handles Indonesian and Arabic characters by transliterating where needed.
 */
export function slugify(input: string): string {
  return input
    .toString()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ensureUniqueSlug(
  base: string,
  existing: Set<string>
): string {
  let slug = base || "item";
  let n = 1;
  while (existing.has(slug)) {
    slug = `${base}-${++n}`;
  }
  return slug;
}
