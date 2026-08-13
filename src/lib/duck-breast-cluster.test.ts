import { describe, expect, it } from "vitest";
import {
  CLUSTER_CLICK_EVENT,
  CLUSTER_GROUPS,
  CLUSTER_GROUP_LABELS,
  DUCK_BREAST_CLUSTER,
  buildClusterClickEvent,
  clusterStopsByGroup,
  clusterStopsExcluding,
  destinationSlug,
  normalisePath,
} from "./duck-breast-cluster";

describe("cluster data", () => {
  it("covers every required destination exactly once", () => {
    const paths = DUCK_BREAST_CLUSTER.map((s) => s.path);
    expect(new Set(paths).size).toBe(paths.length);
    for (const required of [
      "/recipes/pan-seared-duck-breast",
      "/cook/how-to-cook-duck-breast",
      "/learn/why-duck-skin-isnt-crispy",
      "/learn/duck-breast-temperature-doneness",
      "/cook/best-sauces-for-duck-breast",
      "/gear/best-pan-for-duck-breast",
      "/gear/best-thermometer-for-duck",
      "/gear/best-knife-for-scoring-duck",
      "/buy/where-to-buy-duck-online",
      "/tools/duck-doneness-guide",
    ]) {
      expect(paths).toContain(required);
    }
  });

  it("uses internal crawlable paths only", () => {
    for (const stop of DUCK_BREAST_CLUSTER) {
      expect(stop.path.startsWith("/")).toBe(true);
      expect(stop.path).not.toContain("?");
      expect(stop.label.length).toBeGreaterThan(0);
      expect(stop.note.length).toBeGreaterThan(0);
    }
  });

  it("groups every stop into a labelled group", () => {
    for (const stop of DUCK_BREAST_CLUSTER) {
      expect(CLUSTER_GROUPS).toContain(stop.group);
      expect(CLUSTER_GROUP_LABELS[stop.group]).toBeTruthy();
    }
    const grouped = CLUSTER_GROUPS.flatMap((g) => clusterStopsByGroup(g));
    expect(grouped).toHaveLength(DUCK_BREAST_CLUSTER.length);
  });

  it("never links a page to itself", () => {
    const stops = clusterStopsExcluding("/cook/how-to-cook-duck-breast");
    expect(stops.map((s) => s.path)).not.toContain("/cook/how-to-cook-duck-breast");
    expect(stops).toHaveLength(DUCK_BREAST_CLUSTER.length - 1);
    expect(clusterStopsExcluding()).toHaveLength(DUCK_BREAST_CLUSTER.length);
  });
});

describe("normalisePath / destinationSlug", () => {
  it("strips query strings and hashes", () => {
    expect(normalisePath("/newsletter/preferences?t=secret-token")).toBe(
      "/newsletter/preferences",
    );
    expect(normalisePath("/cook/how-to-cook-duck-breast#method")).toBe(
      "/cook/how-to-cook-duck-breast",
    );
    expect(normalisePath("/gear/best-pan-for-duck-breast/")).toBe("/gear/best-pan-for-duck-breast");
    expect(normalisePath("/")).toBe("/");
  });

  it("returns the last segment only", () => {
    expect(destinationSlug("/gear/best-pan-for-duck-breast")).toBe("best-pan-for-duck-breast");
    expect(destinationSlug("/")).toBe("home");
  });
});

describe("buildClusterClickEvent", () => {
  it("emits one stable event name with exactly four parameters", () => {
    const event = buildClusterClickEvent({
      destinationPath: "/gear/best-thermometer-for-duck",
      destinationGroup: "buying",
      sourcePath: "/cook/how-to-cook-duck-breast",
      placement: "cluster_pathway",
    });
    expect(event.name).toBe("duck_breast_cluster_click");
    expect(event.name).toBe(CLUSTER_CLICK_EVENT);
    expect(event.params).toEqual({
      destination_slug: "best-thermometer-for-duck",
      destination_group: "buying",
      source_path: "/cook/how-to-cook-duck-breast",
      placement: "cluster_pathway",
    });
  });

  it("carries no address, token, query string, or full URL", () => {
    const event = buildClusterClickEvent({
      destinationPath: "/recipes/pan-seared-duck-breast?t=abcdef1234567890",
      destinationGroup: "stove",
      sourcePath: "/newsletter/preferences?t=abcdef1234567890&email=duck@example.com",
      placement: "cluster_pathway",
    });
    const serialised = JSON.stringify(event.params);
    expect(serialised).not.toContain("@");
    expect(serialised).not.toContain("?");
    expect(serialised).not.toContain("abcdef1234567890");
    expect(serialised).not.toContain("https://");
    expect(event.params.source_path).toBe("/newsletter/preferences");
  });

  it("tolerates a missing source path without inventing one", () => {
    const event = buildClusterClickEvent({
      destinationPath: "/tools/duck-doneness-guide",
      destinationGroup: "stove",
      sourcePath: undefined,
      placement: "hub_next_answer",
    });
    expect(event.params.source_path).toBe("");
    expect(event.params.destination_slug).toBe("duck-doneness-guide");
  });
});
