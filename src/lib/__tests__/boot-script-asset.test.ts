import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
  bootScriptSource,
  bootScriptVersion,
  bootScriptModule,
} from "../../../scripts/gen-boot-script";
import { BOOT_SCRIPT_SRC } from "../boot-script";

const root = resolve(__dirname, "../../..");
const asset = readFileSync(resolve(root, "public/dd-boot.js"), "utf8");

describe("external analytics bootstrap asset", () => {
  it("matches the generated source (run `bun scripts/gen-boot-script.ts` after changing it)", () => {
    expect(asset.trim()).toBe(bootScriptSource().trim());
  });

  it("keeps the cache-busting version in sync with the asset contents", () => {
    expect(BOOT_SCRIPT_SRC).toBe(`/dd-boot.js?v=${bootScriptVersion()}`);
    expect(readFileSync(resolve(root, "src/lib/boot-script.ts"), "utf8").trim()).toBe(
      bootScriptModule().trim(),
    );
  });

  it("still gates on the QA flag and the production hosts before loading gtag", () => {
    expect(asset).toContain("dd_analytics_optout");
    expect(asset).toContain("deliciousduck.com");
    expect(asset).toContain("googletagmanager.com/gtag/js?id=G-E15CFY209D");
  });

  it("carries no leftover indentation or comment padding", () => {
    expect(asset).not.toMatch(/^[ \t]+\S/m);
    expect(asset).not.toContain("/*");
  });
});

describe("server-rendered documents", () => {
  it("no longer inline the bootstrap in the root shell", () => {
    const root_tsx = readFileSync(resolve(root, "src/routes/__root.tsx"), "utf8");
    expect(root_tsx).not.toContain("dangerouslySetInnerHTML");
    expect(root_tsx).toContain("<script src={BOOT_SCRIPT_SRC} />");
  });
});
