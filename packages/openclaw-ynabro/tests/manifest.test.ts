/**
 * Manifest contract tests for openclaw-ynabro.
 *
 * These tests guard against regressions in `openclaw.plugin.json` that have
 * historically broken the plugin in subtle, install-time-only ways:
 *
 * - The token must remain a SecretRef-eligible surface so users can store it
 *   through `openclaw secrets configure` and `openclaw config set
 *   --ref-source ...`.
 * - The non-functional `setup.providers[{id:"ynab"}]` block (a primitive
 *   intended for model/LLM provider plugins) must not be reintroduced.
 * - The `uiHints.token.help` text must not advertise a `YNAB_TOKEN`
 *   environment-variable fallback that the plugin code does not implement.
 */

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const manifestPath = resolve(here, "..", "openclaw.plugin.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

describe("openclaw.plugin.json", () => {
  it("declares the plugin id and name", () => {
    expect(manifest.id).toBe("openclaw-ynabro");
    expect(typeof manifest.name).toBe("string");
    expect(manifest.name.length).toBeGreaterThan(0);
  });

  describe("configSchema", () => {
    it("declares token as accepting either a plaintext string or a SecretRef object", () => {
      // OpenClaw's config validator requires SecretRef-eligible fields to accept
      // both "string" (plaintext) and "object" (SecretRef { source, provider, id }).
      // Declaring only "string" causes `openclaw config set --ref-source ...` to
      // fail with `invalid config: must be string`. Matches the stock comfy plugin
      // pattern for its `apiKey` field.
      const tokenType = manifest.configSchema?.properties?.token?.type;
      expect(Array.isArray(tokenType)).toBe(true);
      expect(tokenType).toEqual(expect.arrayContaining(["string", "object"]));
    });

    it("declares defaultPlanId as a plaintext string (non-secret)", () => {
      expect(manifest.configSchema?.properties?.defaultPlanId?.type).toBe(
        "string",
      );
    });
  });

  describe("configContracts.secretInputs (SecretRef surface registration)", () => {
    it("registers the token path as a SecretRef-eligible surface", () => {
      const paths = manifest.configContracts?.secretInputs?.paths;
      expect(Array.isArray(paths)).toBe(true);
      expect(paths).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: "token", expected: "string" }),
        ]),
      );
    });

    it("does not register defaultPlanId as a secret (non-secret config)", () => {
      const paths = manifest.configContracts?.secretInputs?.paths ?? [];
      const planIdEntry = paths.find(
        (p: { path?: string }) => p?.path === "defaultPlanId",
      );
      expect(planIdEntry).toBeUndefined();
    });
  });

  describe("uiHints.token", () => {
    it("marks the token field as sensitive", () => {
      expect(manifest.uiHints?.token?.sensitive).toBe(true);
    });

    it("uses the user-facing label", () => {
      expect(manifest.uiHints?.token?.label).toBe("YNAB Personal Access Token");
    });

    it("help text does not advertise a YNAB_TOKEN env-var fallback", () => {
      const help: string = manifest.uiHints?.token?.help ?? "";
      expect(help.toUpperCase()).not.toContain("YNAB_TOKEN");
      expect(help.toLowerCase()).not.toMatch(/env\s*var/);
      expect(help.toLowerCase()).not.toMatch(/fall(s|back)/);
    });
  });

  describe("setup", () => {
    it("does not declare a setup.providers[] block (ynabro is a tool plugin, not a model provider)", () => {
      const setup = manifest.setup;
      if (setup == null) return;
      const providers = setup.providers ?? [];
      expect(Array.isArray(providers)).toBe(true);
      const ynabProvider = providers.find(
        (p: { id?: string }) => p?.id === "ynab",
      );
      expect(ynabProvider).toBeUndefined();
    });
  });

  describe("pluginConfigSchema (via default export)", () => {
    it("accepts undefined", async () => {
      const { default: plugin } = await import("../src/index.ts");
      const result = (
        plugin.configSchema as {
          safeParse: (v: unknown) => { success: boolean };
        }
      ).safeParse(undefined);
      expect(result.success).toBe(true);
    });

    it("accepts empty object", async () => {
      const { default: plugin } = await import("../src/index.ts");
      const result = (
        plugin.configSchema as {
          safeParse: (v: unknown) => { success: boolean };
        }
      ).safeParse({});
      expect(result.success).toBe(true);
    });

    it("accepts { token: string }", async () => {
      const { default: plugin } = await import("../src/index.ts");
      const result = (
        plugin.configSchema as {
          safeParse: (v: unknown) => { success: boolean };
        }
      ).safeParse({ token: "tok" });
      expect(result.success).toBe(true);
    });

    it("accepts { token: SecretRef object }", async () => {
      const { default: plugin } = await import("../src/index.ts");
      const result = (
        plugin.configSchema as {
          safeParse: (v: unknown) => { success: boolean };
        }
      ).safeParse({
        token: { source: "env", provider: "default", id: "X" },
      });
      expect(result.success).toBe(true);
    });

    it("accepts { token: string, defaultPlanId: string }", async () => {
      const { default: plugin } = await import("../src/index.ts");
      const result = (
        plugin.configSchema as {
          safeParse: (v: unknown) => { success: boolean };
        }
      ).safeParse({
        token: "tok",
        defaultPlanId: "pid",
      });
      expect(result.success).toBe(true);
    });

    it("rejects unknown keys", async () => {
      const { default: plugin } = await import("../src/index.ts");
      const result = (
        plugin.configSchema as {
          safeParse: (v: unknown) => { success: boolean };
        }
      ).safeParse({ unknownKey: 1 });
      expect(result.success).toBe(false);
    });

    it("rejects non-object values", async () => {
      const { default: plugin } = await import("../src/index.ts");
      const result = (
        plugin.configSchema as {
          safeParse: (v: unknown) => { success: boolean };
        }
      ).safeParse(42);
      expect(result.success).toBe(false);
    });
  });

  describe("contracts.tools", () => {
    const expectedTools = [
      "ynabro_onboarding_status",
      "ynabro_setup",
      "ynabro_save_default_plan",
      "ynabro_get_pending_transactions",
      "ynabro_get_recent_transactions",
      "ynabro_approve_transaction",
      "ynabro_get_plan_info",
      "ynabro_get_skill_state",
      "ynabro_update_skill_state",
    ];

    it("declares every tool the plugin registers", () => {
      const declared: string[] = manifest.contracts?.tools ?? [];
      for (const tool of expectedTools) {
        expect(declared).toContain(tool);
      }
    });
  });
});
