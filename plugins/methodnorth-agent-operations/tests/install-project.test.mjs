import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);
const temporaryDirectories = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

describe("future-project installer", () => {
  it("leaves the generated GitHub integration configured but not tested", async () => {
    const directory = await mkdtemp(join(tmpdir(), "methodnorth-agent-ops-install-"));
    temporaryDirectories.push(directory);
    const installer = join(
      process.cwd(),
      "plugins/methodnorth-agent-operations/scripts/install-project.mjs",
    );

    await execFileAsync("node", [
      installer,
      "--target",
      directory,
      "--project-id",
      "test-project",
      "--project-name",
      "Test Project",
      "--task-prefix",
      "TEST",
      "--role-namespace",
      "test-team",
    ]);

    const integrations = JSON.parse(
      await readFile(join(directory, ".github/agent-operations/integrations.json"), "utf8"),
    );
    const github = integrations.integrations.find(
      (integration) => integration.id === "github-ledger",
    );
    expect(github.configuration_status).toBe("configured");
    expect(github.verification).toEqual({ status: "not-tested" });

    const validator = join(
      process.cwd(),
      "plugins/methodnorth-agent-operations/scripts/validate-project.mjs",
    );
    await expect(execFileAsync("node", [validator, directory])).resolves.toMatchObject({
      stderr: "",
    });
  });
});
