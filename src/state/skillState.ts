import fs from "node:fs";
import path from "node:path";

const BASE_DIR = ".ynabro/skills";

export interface SkillState {
  last_knowledge_of_server: number | null;
  auto_approve_enabled: boolean;
  memory: unknown[];
}

const DEFAULT_STATE: SkillState = {
  last_knowledge_of_server: null,
  auto_approve_enabled: false,
  memory: [],
};

function getSkillStatePath(skillSlug: string): string {
  return path.join(BASE_DIR, skillSlug, "state.json");
}

function ensureSkillDir(skillSlug: string) {
  const dir = path.join(BASE_DIR, skillSlug);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function getSkillState(skillSlug: string): SkillState {
  const filePath = getSkillStatePath(skillSlug);
  if (!fs.existsSync(filePath)) {
    ensureSkillDir(skillSlug);
    fs.writeFileSync(filePath, JSON.stringify(DEFAULT_STATE, null, 2));
    return { ...DEFAULT_STATE };
  }
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

export function updateSkillState(
  skillSlug: string,
  updates: Partial<SkillState>,
) {
  const current = getSkillState(skillSlug);
  const newState = { ...current, ...updates };
  const filePath = getSkillStatePath(skillSlug);
  ensureSkillDir(skillSlug);
  fs.writeFileSync(filePath, JSON.stringify(newState, null, 2));
}
