/**
 * Public social-profile registry.
 *
 * Deliberately EMPTY: DeliciousDuck does not currently render any public social
 * profile links, and no profile URL may be invented here. Adding a row is what
 * makes `outbound_social_click` fire in production — the tracking wrapper in
 * `@/components/site/SocialLinks` reads this registry and renders nothing while
 * it is empty, so there is no unverifiable link surface on the site.
 *
 * To activate later: add a row with a real, verified profile URL. No other code
 * change is needed.
 */

export type SocialPlatform =
  | "instagram"
  | "youtube"
  | "pinterest"
  | "facebook"
  | "tiktok"
  | "x";

export interface SocialLinkEntry {
  /** Stable platform id — becomes the `platform` analytics parameter. */
  platform: SocialPlatform;
  /** Visitor-facing label. */
  label: string;
  /** Absolute, verified public profile URL. */
  url: string;
}

export const SOCIAL_LINKS: SocialLinkEntry[] = [];

export function socialLinkFor(platform: SocialPlatform): SocialLinkEntry | undefined {
  return SOCIAL_LINKS.find((entry) => entry.platform === platform);
}
