import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";

const __filename = fileURLToPath(import.meta.url);
const __dir = dirname(__filename);
const REPO_ROOT = resolve(__dir, "../../..");
const OPENCLAW_SRC = resolve(
  REPO_ROOT,
  "packages/openclaw-ynabro/src/index.ts",
);
const PI_SRC = resolve(REPO_ROOT, "packages/pi-ynabro/src/index.ts");

let openClawSrc: string;
let piSrc: string;

beforeAll(() => {
  openClawSrc = readFileSync(OPENCLAW_SRC, "utf-8");
  piSrc = readFileSync(PI_SRC, "utf-8");
});

describe("openclaw-ynabro conformance", () => {
  it("imports setupYnab from core", () => {
    expect(
      openClawSrc,
      "openclaw-ynabro must import setupYnab from 'ynabro', not define it locally",
    ).toContain("setupYnab");
    expect(
      openClawSrc,
      "openclaw-ynabro must import setupYnab from 'ynabro', not define it locally",
    ).toContain('from "ynabro"');
  });

  it("imports YnabroConfigAdapter from core", () => {
    expect(
      openClawSrc,
      "openclaw-ynabro must import YnabroConfigAdapter from 'ynabro'",
    ).toContain("YnabroConfigAdapter");
    expect(
      openClawSrc,
      "openclaw-ynabro must import YnabroConfigAdapter from 'ynabro'",
    ).toContain('from "ynabro"');
  });

  it("does not locally redefine YnabroConfigAdapter", () => {
    expect(
      openClawSrc,
      "openclaw-ynabro must not locally redefine YnabroConfigAdapter — import it from 'ynabro'",
    ).not.toMatch(/interface YnabroConfigAdapter/);
  });

  it("does not read YNAB_TOKEN from env", () => {
    expect(
      openClawSrc,
      "openclaw-ynabro must not read YNAB_TOKEN from environment — use api.pluginConfig.token only",
    ).not.toContain("YNAB_TOKEN");
  });

  it("does not reference legacy .ynabro config file", () => {
    expect(
      openClawSrc,
      "openclaw-ynabro must not reference the legacy .ynabro/config.json path",
    ).not.toContain(".ynabro");
    expect(
      openClawSrc,
      "openclaw-ynabro must not reference the legacy .ynabro/config.json path",
    ).not.toContain("config.json");
  });

  it("does not declare planIdSchema", () => {
    expect(
      openClawSrc,
      "openclaw-ynabro must not declare planIdSchema — plan-dependent tools use getDefaultPlanId() internally",
    ).not.toContain("planIdSchema");
  });

  it("registers ynabro_save_default_plan tool", () => {
    expect(
      openClawSrc,
      "openclaw-ynabro must register the ynabro_save_default_plan tool for two-step onboarding",
    ).toContain("ynabro_save_default_plan");
  });
});

describe("pi-ynabro conformance", () => {
  it("imports setupYnab from core", () => {
    expect(piSrc, "pi-ynabro must import setupYnab from 'ynabro'").toContain(
      "setupYnab",
    );
    expect(piSrc, "pi-ynabro must import setupYnab from 'ynabro'").toContain(
      'from "ynabro"',
    );
  });

  it("imports YnabroConfigAdapter from core", () => {
    expect(
      piSrc,
      "pi-ynabro must import YnabroConfigAdapter from 'ynabro'",
    ).toContain("YnabroConfigAdapter");
    expect(
      piSrc,
      "pi-ynabro must import YnabroConfigAdapter from 'ynabro'",
    ).toContain('from "ynabro"');
  });

  it("does not locally redefine YnabroConfigAdapter", () => {
    expect(
      piSrc,
      "pi-ynabro must not locally redefine YnabroConfigAdapter — import it from 'ynabro'",
    ).not.toMatch(/interface YnabroConfigAdapter/);
  });

  it("does not read YNAB_TOKEN from env", () => {
    expect(
      piSrc,
      "pi-ynabro must not read YNAB_TOKEN from environment — token is managed via AuthStorage",
    ).not.toContain("YNAB_TOKEN");
  });

  it("does not reference legacy .ynabro config file", () => {
    expect(
      piSrc,
      "pi-ynabro must not reference the legacy .ynabro/config.json path",
    ).not.toContain(".ynabro");
    expect(
      piSrc,
      "pi-ynabro must not reference the legacy .ynabro/config.json path",
    ).not.toContain("config.json");
  });

  it("calls setupYnab from core (not setDefaultPlanId directly)", () => {
    expect(
      piSrc,
      "pi-ynabro must call setupYnab() from core rather than calling piConfigAdapter.setDefaultPlanId() directly",
    ).toContain("setupYnab(");
  });
});
