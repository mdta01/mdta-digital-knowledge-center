import { db } from "@/lib/db";

/**
 * Setting repository — key/value store for site-wide configuration.
 * Values are JSON-encoded strings.
 */
export class SettingRepository {
  async get(key: string): Promise<string | null> {
    const row = await db.setting.findUnique({ where: { key } });
    return row?.value ?? null;
  }

  async getJSON<T>(key: string, fallback: T): Promise<T> {
    const raw = await this.get(key);
    if (!raw) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  async set(key: string, value: string, type = "string"): Promise<void> {
    await db.setting.upsert({
      where: { key },
      create: { key, value, type },
      update: { value, type },
    });
  }

  async setJSON(key: string, value: unknown, type = "json"): Promise<void> {
    await this.set(key, JSON.stringify(value), type);
  }

  async getAll(): Promise<Record<string, string>> {
    const rows = await db.setting.findMany();
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  }

  async getAllJSON(): Promise<Record<string, unknown>> {
    const all = await this.getAll();
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(all)) {
      try {
        out[k] = JSON.parse(v);
      } catch {
        out[k] = v;
      }
    }
    return out;
  }

  async delete(key: string): Promise<void> {
    await db.setting.delete({ where: { key } });
  }
}

export const settingRepository = new SettingRepository();

/** Default settings keys used by the site. */
export const SETTING_KEYS = {
  SITE_NAME: "site.name",
  SITE_LOGO: "site.logo",
  SITE_FAVICON: "site.favicon",
  SITE_DESCRIPTION: "site.description",
  SITE_KEYWORDS: "site.keywords",
  FOOTER_TEXT: "site.footer",
  PRIMARY_COLOR: "theme.primary",
  ACCENT_COLOR: "theme.accent",
  SOCIAL_FACEBOOK: "social.facebook",
  SOCIAL_INSTAGRAM: "social.instagram",
  SOCIAL_YOUTUBE: "social.youtube",
  SOCIAL_TELEGRAM: "social.telegram",
  CONTACT_ADDRESS: "contact.address",
  CONTACT_WHATSAPP: "contact.whatsapp",
  CONTACT_EMAIL: "contact.email",
  CONTACT_MAPS_URL: "contact.maps_url",
  GOOGLE_ANALYTICS: "analytics.ga_id",
  ISLAMIC_QUOTE: "content.islamic_quote",
  QUOTE_AUTHOR: "content.quote_author",
  // V2 — Theme customizer
  THEME_BG_COLOR: "theme.bg_color",
  THEME_HERO_IMAGE: "theme.hero_image",
  THEME_FONT_HEADING: "theme.font_heading",
  THEME_FONT_BODY: "theme.font_body",
  THEME_BORDER_RADIUS: "theme.border_radius",
  // V2 — Maintenance
  MAINTENANCE_ENABLED: "maintenance.enabled",
  MAINTENANCE_MESSAGE: "maintenance.message",
  MAINTENANCE_START: "maintenance.start",
  MAINTENANCE_END: "maintenance.end",
  MAINTENANCE_WHITELIST_IPS: "maintenance.whitelist_ips",
  // V2 — Branding
  APP_CONCEPT: "app.concept", // "MDTA Digital Knowledge Center"
} as const;
