import { describe, expect, it } from "vitest";
import {
  DUCK_BREAST_CLUSTER_PATHS,
  clusterDistributionMetadata,
  distributionMetadata,
} from "@/lib/distribution-metadata";
import { absUrl } from "@/lib/seo";
import { sitemapPaths } from "@/lib/sitemap";
import { shouldEmitAnalytics } from "@/lib/analytics-gate";

describe("duck-breast cluster distribution metadata", () => {
  it("registers every cluster page", () => {
    expect(clusterDistributionMetadata("duck-breast").map((m) => m.path)).toEqual([
      ...DUCK_BREAST_CLUSTER_PATHS,
    ]);
  });

  it("is complete and self-referencing on every cluster page", () => {
    for (const path of DUCK_BREAST_CLUSTER_PATHS) {
      const meta = distributionMetadata(path);
      expect(meta, path).not.toBeNull();
      const m = meta!;
      expect(m.canonicalUrl).toBe(absUrl(path));
      expect(m.shareUrl).toBe(m.canonicalUrl);
      expect(m.cluster).toBe("duck-breast");
      expect(m.primaryImage.startsWith("https://") || m.primaryImage.startsWith("/")).toBe(true);
      expect(m.primaryImageAlt.length).toBeGreaterThan(10);
      for (const value of [
        m.title,
        m.description,
        m.socialTitle,
        m.socialDescription,
        m.pinterestTitle,
        m.pinterestDescription,
      ]) {
        expect(value.trim().length, `${path}: ${value}`).toBeGreaterThan(10);
      }
      expect(m.pinterestDescription.length).toBeLessThanOrEqual(500);
      for (const url of [m.canonicalUrl, m.shareUrl]) {
        expect(url).not.toContain("?");
        expect(url).not.toContain("#");
      }
    }
  });

  it("keeps every title and description literal and unique across the cluster", () => {
    const all = clusterDistributionMetadata("duck-breast");
    for (const field of [
      "title",
      "description",
      "socialTitle",
      "pinterestTitle",
      "pinterestDescription",
    ] as const) {
      const values = all.map((m) => m[field]);
      expect(new Set(values).size, field).toBe(values.length);
    }
  });

  it("keeps every cluster page in the sitemap", () => {
    const paths = sitemapPaths();
    for (const path of DUCK_BREAST_CLUSTER_PATHS) {
      expect(paths, path).toContain(path);
    }
  });

  it("returns null for unregistered paths", () => {
    expect(distributionMetadata("/about")).toBeNull();
    expect(distributionMetadata("/internal/growth-dashboard")).toBeNull();
  });
});

describe("cluster pages only transmit analytics from production hosts", () => {
  it("emits on canonical hosts and stays silent on localhost and Lovable hosts", () => {
    for (const path of DUCK_BREAST_CLUSTER_PATHS) {
      expect(shouldEmitAnalytics({ hostname: "deliciousduck.com", path })).toBe(true);
      expect(shouldEmitAnalytics({ hostname: "www.deliciousduck.com", path })).toBe(true);
      for (const host of [
        "localhost",
        "127.0.0.1",
        "id-preview--7d297173-9e35-42c7-a3d5-1000d17e9f47.lovable.app",
        "duck-kitchen-quest.lovable.app",
        "duck-kitchen-quest-dev.lovable.app",
        "lovable.dev",
        "staging.deliciousduck.com",
      ]) {
        expect(shouldEmitAnalytics({ hostname: host, path }), host).toBe(false);
      }
    }
  });
});
