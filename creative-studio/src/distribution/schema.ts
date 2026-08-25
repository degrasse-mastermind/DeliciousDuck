import {z} from "zod";

export const publishStatusSchema = z.enum(["draft", "approved", "scheduled", "published", "paused", "retired"]);
export const checklistSchema = z.object({
  correct_final_asset: z.boolean(), correct_platform_dimensions: z.boolean(), source_truth_current: z.boolean(),
  provenance_approved: z.boolean(), caption_reviewed: z.boolean(), destination_verified: z.boolean(),
  utm_verified: z.boolean(), cta_reviewed: z.boolean(), alt_text_present: z.boolean(), cover_verified: z.boolean(),
  platform_safe_crop: z.boolean(), no_quarantined_media: z.boolean(),
});

export const performanceSchema = z.object({
  impressions: z.number().nonnegative().nullable(), views: z.number().nonnegative().nullable(),
  three_second_views: z.number().nonnegative().nullable(), average_watch_time: z.number().nonnegative().nullable(),
  completion_rate: z.number().min(0).max(1).nullable(), outbound_clicks: z.number().nonnegative().nullable(),
  outbound_ctr: z.number().min(0).max(1).nullable(), saves: z.number().nonnegative().nullable(),
  shares: z.number().nonnegative().nullable(), likes: z.number().nonnegative().nullable(),
  comments: z.number().nonnegative().nullable(), site_sessions: z.number().nonnegative().nullable(),
  engaged_visits: z.number().nonnegative().nullable(), newsletter_signups: z.number().nonnegative().nullable(),
  internal_conversions: z.number().nonnegative().nullable(), affiliate_clicks: z.number().nonnegative().nullable(),
});

export const distributionRecordSchema = z.object({
  distribution_id: z.string().regex(/^DD-DIST-[A-Z0-9-]+-v\d{2}$/), asset_id: z.string().min(3),
  source_path: z.string().startsWith("/"), canonical_url: z.string().url().refine((v) => !/[?#]/.test(v)),
  platform: z.enum(["pinterest", "tiktok", "instagram-reels", "instagram-carousel", "youtube-shorts"]),
  format: z.enum(["pin", "short", "carousel"]), content_job: z.string().min(3), cluster: z.string(), series: z.string(),
  headline: z.string(), platform_title: z.string(), platform_caption: z.string(), description: z.string(),
  alt_text: z.string(), hashtags: z.array(z.string()).max(5), cta: z.string(), destination_url: z.string().url(),
  utm_source: z.string(), utm_medium: z.literal("social"), utm_campaign: z.string(), utm_content: z.string(),
  hypothesis: z.string().min(10), primary_metric: z.string(), secondary_metric: z.string(),
  asset_path: z.string(), cover_path: z.string().nullable(), caption_path: z.string().nullable(),
  publish_status: publishStatusSchema, scheduled_date: z.string().date(), published_at: z.string().datetime().nullable(),
  external_post_id: z.string().nullable(), external_post_url: z.string().url().nullable(),
  performance_status: z.enum(["not-started", "awaiting-data", "partial", "complete"]),
  performance: performanceSchema, checklist: checklistSchema, notes: z.string(), visual_treatment: z.string(),
  search_intent: z.string().nullable(), slide_count: z.number().int().positive().nullable(),
});

export const distributionManifestSchema = z.object({
  version: z.literal(1), generated_at: z.string().datetime(), campaign: z.string(), timezone: z.string(),
  records: z.array(distributionRecordSchema).min(1),
}).superRefine((manifest, ctx) => {
  const ids = new Set<string>();
  for (const [index, record] of manifest.records.entries()) {
    if (ids.has(record.distribution_id)) ctx.addIssue({code: "custom", path: ["records", index, "distribution_id"], message: "Duplicate distribution ID"});
    ids.add(record.distribution_id);
    const required = Object.entries(record.checklist).filter(([key]) => key !== "cover_verified" || record.format === "short");
    if (["approved", "scheduled", "published"].includes(record.publish_status) && required.some(([, value]) => !value)) {
      ctx.addIssue({code: "custom", path: ["records", index, "checklist"], message: "Approved-or-later records require every applicable check"});
    }
  }
});

export type DistributionRecord = z.infer<typeof distributionRecordSchema>;
export type DistributionManifest = z.infer<typeof distributionManifestSchema>;
