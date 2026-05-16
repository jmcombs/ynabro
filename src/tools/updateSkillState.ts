import { updateSkillState as update } from '../state/skillState.js';

/**
 * Updates the state for a given skill.
 */
export async function updateSkillState(skillSlug: string, updates: object) {
  update(skillSlug, updates);
  return { success: true };
}
