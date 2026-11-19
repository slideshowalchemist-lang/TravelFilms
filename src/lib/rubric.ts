// The trip pass rubric: every site is scored 1–5 on the same seven criteria, and the
// overall verdict is worked out from those scores (see "Egypt Trip Pass — Site Rubric").
// Criteria 1–6 are the reward of visiting; criterion 7 is the effort of getting there.

export const CRITERIA = [
  { key: 'scale', label: 'Scale & wow', short: 'Scale', benchmark: 'Karnak hypostyle hall, Abu Simbel façade' },
  { key: 'preservation', label: 'Preservation', short: 'Preservation', benchmark: 'Dendera, Medinet Habu' },
  { key: 'colour', label: 'Colour', short: 'Colour', benchmark: 'Nefertari, Sennefer' },
  { key: 'sculpture', label: 'Sculpture & rock-cut features', short: 'Sculpture', benchmark: 'Abu Simbel, Meresankh III' },
  { key: 'uniqueness', label: 'Uniqueness', short: 'Uniqueness', benchmark: 'Nothing else like it in Egypt' },
  { key: 'story', label: 'Story', short: 'Story', benchmark: 'A story everyone wants to hear' },
  { key: 'access', label: 'Getting there', short: 'Getting there', benchmark: 'Ramesseum: minutes away, car park at the gate' },
] as const;

export type CriterionKey = (typeof CRITERIA)[number]['key'];
export type Scores = Partial<Record<CriterionKey, number>>;

export const REWARD_KEYS: CriterionKey[] = ['scale', 'preservation', 'colour', 'sculpture', 'uniqueness', 'story'];

export const VERDICT_LABELS = {
  unmissable: 'Unmissable',
  'worth-it': 'Worth it',
  enthusiasts: 'For enthusiasts',
  'if-you-have-time': 'If you have time',
} as const;
export type VerdictKey = keyof typeof VERDICT_LABELS;

/** True once all seven criteria have a score. */
export const isScored = (s: Scores | undefined): s is Required<Scores> =>
  !!s && CRITERIA.every((c) => typeof s[c.key] === 'number');

/** Average of criteria 1–6, rounded to one decimal place. */
export function rewardScore(s: Required<Scores>): number {
  const total = REWARD_KEYS.reduce((sum, k) => sum + s[k], 0);
  return Math.round((total / REWARD_KEYS.length) * 10) / 10;
}

/** The verdict rules, applied top to bottom; the first match wins. */
export function verdictFromScores(s: Required<Scores>): VerdictKey {
  const reward = rewardScore(s);
  const spike = REWARD_KEYS.some((k) => s[k] >= 4);
  if (reward >= 4 || s.scale === 5 || s.uniqueness === 5) return 'unmissable';
  if (reward >= 3 && s.access >= 3) return 'worth-it';
  if (reward >= 3 || spike) return 'enthusiasts';
  return 'if-you-have-time';
}

/** One plain-English line explaining which rule gave the verdict. */
export function verdictReason(s: Required<Scores>): string {
  const reward = rewardScore(s);
  const v = verdictFromScores(s);
  if (v === 'unmissable')
    return reward >= 4 ? 'Reward of 4.0 or more.' : 'A 5 for scale or uniqueness, whatever the effort.';
  if (v === 'worth-it') return 'Reward of 3.0–3.9, and reasonably easy to get to.';
  if (v === 'enthusiasts')
    return reward >= 3 ? 'Good reward, but it takes real effort to get there.' : 'One standout feature makes it worth it for some.';
  return 'Lower reward for the effort. Worth it if your days allow.';
}
