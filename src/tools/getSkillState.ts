import { getSkillState as getState } from '../state/skillState.js';

/**
 * Returns the current state for a given skill.
 */
export async function getSkillState(skillSlug: string) {
  return getState(skillSlug);
}
