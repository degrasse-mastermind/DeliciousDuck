/**
 * Optional structured acquisition metadata on a subscriber row.
 *
 * The Duck Game Plan asks four questions with finite answers. Storing them lets
 * DeliciousDuck understand audience demand (what people are actually cooking and
 * what they are worried about) without adding a single new piece of personal
 * data: every value is a member of a closed enum, and none of them describes the
 * person.
 *
 * Forward-compatible by design. The columns are additive and nullable, and the
 * writer below is paired with `isMissingAcquisitionColumn`, so a build that runs
 * against a database where the migration has not been applied yet still stores
 * the subscriber — it just drops these four fields and retries. That means the
 * signup path never depends on a schema change landing first.
 */

import type { SubscribePayload } from "./newsletter-schema";

/** Column names this module owns. Nothing else in the row is touched. */
export const ACQUISITION_COLUMNS = [
  "acquisition_source",
  "acquisition_cut",
  "acquisition_method",
  "acquisition_concern",
  "acquisition_party_size",
] as const;

export type AcquisitionColumn = (typeof ACQUISITION_COLUMNS)[number];

/**
 * Maps a validated signup payload onto the optional columns. Absent selections
 * produce no keys at all, so an ordinary newsletter signup writes nothing new.
 */
export function acquisitionColumns(
  data: Pick<
    SubscribePayload,
    "acquisitionSource" | "cut" | "method" | "concern" | "partySizeBucket"
  >,
): Partial<Record<AcquisitionColumn, string>> {
  return {
    ...(data.acquisitionSource ? { acquisition_source: data.acquisitionSource } : {}),
    ...(data.cut ? { acquisition_cut: data.cut } : {}),
    ...(data.method ? { acquisition_method: data.method } : {}),
    ...(data.concern ? { acquisition_concern: data.concern } : {}),
    ...(data.partySizeBucket ? { acquisition_party_size: data.partySizeBucket } : {}),
  };
}

/** Strips the acquisition columns from a payload for the fallback write. */
export function withoutAcquisitionColumns<T extends Record<string, unknown>>(payload: T): T {
  const out = { ...payload };
  for (const column of ACQUISITION_COLUMNS) delete out[column];
  return out;
}

/**
 * True when a storage failure is "these columns do not exist yet" rather than a
 * real problem. PostgREST reports an unknown column as `PGRST204` and the
 * database as `42703`; both messages name the column.
 */
export function isMissingAcquisitionColumn(message: string | null | undefined): boolean {
  if (!message) return false;
  const text = message.toLowerCase();
  const looksSchemaShaped =
    text.includes("column") || text.includes("pgrst204") || text.includes("42703");
  if (!looksSchemaShaped) return false;
  return ACQUISITION_COLUMNS.some((column) => text.includes(column));
}
