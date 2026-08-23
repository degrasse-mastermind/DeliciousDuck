import { z } from "zod";

export const assetSchema = z.object({
  asset_id: z.string().regex(/^DD-[A-Z]+-[a-z0-9-]+-[A-Z]+-\d{8}-v\d{2}$/),
  source_path: z.string().startsWith("/"),
  canonical_url: z.string().url().refine((value) => !/[?#]/.test(value)),
  cluster: z.literal("duck-breast"),
  pillar: z.enum(["COOK", "LEARN", "RECIPE"]),
  platform: z.enum(["pinterest", "instagram", "story", "reel", "tiktok", "youtube", "web", "print"]),
  format: z.enum(["PIN", "CAR", "STORY", "COVER", "SHORT", "RECIPE", "REF"]),
  content_job: z.string().min(3),
  truth_sentence: z.string().min(8),
  hook: z.string().min(2),
  headline: z.string().min(2),
  subhead: z.string(),
  CTA: z.string().min(2),
  primary_image: z.string().min(3),
  image_alt: z.string().min(8),
  preferred_visual_treatment: z.enum(["photography", "technical-illustration", "editorial-illustration", "mixed-media", "deterministic-graphic"]).optional(),
  media_slots: z.array(z.string().min(2)).optional(),
  series_tag: z.string().min(2),
  dimensions: z.object({width: z.number().int().positive(), height: z.number().int().positive()}),
  safe_zone: z.object({left: z.number(), right: z.number(), top: z.number(), bottom: z.number()}),
  output_files: z.array(z.string()).min(1),
  source_claims: z.array(z.string()).min(1),
  verification_notes: z.string().min(3),
  variant_parent: z.string().nullable(),
  version: z.literal(1),
  description_suggestion: z.string().optional(),
});

export const manifestSchema = z.object({
  generated_at: z.string(),
  source_commit: z.string().length(40),
  assets: z.array(assetSchema).min(1),
});

export type AssetManifest = z.infer<typeof assetSchema>;
