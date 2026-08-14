import type { ReactNode } from "react";
import { FIELD_GUIDE } from "@/data/starter-guide";
import { SOCIAL_LINKS } from "@/data/social-links";
import { trackLeadMagnetDownload, trackOutboundSocialClick } from "@/lib/analytics";

/** Stable analytics id for the one first-party lead magnet we ship. */
export const FIELD_GUIDE_ASSET_ID = "duck-fundamentals-field-guide";

/**
 * Reusable lead-magnet download link.
 *
 * Every live download surface for the Field Guide PDF must use this component
 * rather than an ad hoc `onClick`, so `lead_magnet_download` fires exactly once
 * per real click with the same allowlisted, PII-free payload everywhere.
 * Tracking is fire-and-forget and can never block the download.
 */
export function LeadMagnetDownloadLink({
  placement,
  className = "",
  children,
  assetId = FIELD_GUIDE_ASSET_ID,
  assetPath = FIELD_GUIDE.path,
  ...rest
}: {
  placement: string;
  className?: string;
  children: ReactNode;
  assetId?: string;
  assetPath?: string;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "onClick" | "className">) {
  return (
    <a
      {...rest}
      href={assetPath}
      data-analytics-event="lead_magnet_download"
      onClick={() => trackLeadMagnetDownload({ assetId, assetPath, placement })}
      className={className}
    >
      {children}
    </a>
  );
}

/**
 * Reusable outbound social-profile link.
 *
 * Renders nothing while `SOCIAL_LINKS` is empty — no profile URL is invented
 * anywhere in the codebase. As soon as a real, verified profile is registered,
 * this wrapper emits `outbound_social_click` with platform, placement,
 * destination host and source path only.
 */
export function SocialLinks({
  placement,
  className = "",
  linkClassName = "",
}: {
  placement: string;
  className?: string;
  linkClassName?: string;
}) {
  if (SOCIAL_LINKS.length === 0) return null;

  return (
    <ul className={className}>
      {SOCIAL_LINKS.map((entry) => (
        <li key={entry.platform}>
          <a
            href={entry.url}
            target="_blank"
            rel="noopener"
            data-analytics-event="outbound_social_click"
            onClick={() =>
              trackOutboundSocialClick({
                platform: entry.platform,
                url: entry.url,
                placement,
              })
            }
            className={linkClassName}
          >
            {entry.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
