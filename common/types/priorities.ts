export type PrioritiesT = readonly {readonly stage: string}[]
export type Priority<T extends PrioritiesT> = number & {
	__priority_type_do_not_use_or_program_will_crash: T
}
export type PriorityDict<T extends PrioritiesT> = {
	readonly [stage in T[number]['stage']]: Priority<T>
}
export type PrioritySrc<T> = T extends PriorityDict<infer Priorities>
	? Priorities
	: never

function createPriorityDictionary<T extends PrioritiesT>(
	priorities: Exclude<T, {stage: string}[]>,
): PriorityDict<T> {
	return priorities.reduce(
		(r, {stage}, i) => {
			if (stage in r)
				throw new Error(
					'Priority dictionary should not include duplicate stages',
				)
			r[stage] = i
			return r
		},
		{} as Record<string, number>,
	) as any
}

/**
 * @member PUSH_IGNORE_CARDS: rare xB, Ignore Attach effect
 * @member HERMIT_SET_TARGET: Hermits updating the intended target of attacks
 * @member HERMIT_CHANGE_TARGET: Betrayed effect, Sheep Stare effect
 * @member LIGHTNING_ROD_REDIRECT
 * @member TARGET_BLOCK_REDIRECT
 * @member HERMIT_MODIFY_DAMAGE: Hermits changing the damage of an attack or adding sub-attacks
 * @member EFFECT_MODIFY_DAMAGE: Invisibility effects
 * @member HERMIT_APPLY_ATTACK: Hermits applying their effect to the board
 * @member APPLY_SINGLE_USE_ATTACK: Single use attack cards: Bow, Swords, etc.
 */
export const beforeAttack = createPriorityDictionary([
	{stage: 'PUSH_IGNORE_CARDS'},
	{stage: 'HERMIT_SET_TARGET'},
	{stage: 'HERMIT_CHANGE_TARGET'},
	{stage: 'LIGHTNING_ROD_REDIRECT'},
	{stage: 'TARGET_BLOCK_REDIRECT'},
	{stage: 'HERMIT_MODIFY_DAMAGE'},
	{stage: 'EFFECT_MODIFY_DAMAGE'},
	{stage: 'HERMIT_APPLY_ATTACK'},
	{stage: 'APPLY_SINGLE_USE_ATTACK'},
] as const)

/**
 * @member HERMIT_BLOCK_DAMAGE: Royal Protection effect
 * @member EFFECT_BLOCK_DAMAGE: Turtle Shell, Chainmail
 * @member FORCE_WEAKNESS_ATTACK: Weakness effect
 * @member EFFECT_REDUCE_DAMAGE: Armor, Shield
 * @member EFFECT_REMOVE_STATUS: Milk Bucket, Water Bucket
 * @member EFFECT_CREATE_BACKLASH: Wolf, Thorns
 */
export const beforeDefence = createPriorityDictionary([
	{stage: 'HERMIT_BLOCK_DAMAGE'},
	{stage: 'EFFECT_BLOCK_DAMAGE'},
	{stage: 'FORCE_WEAKNESS_ATTACK'},
	{stage: 'EFFECT_REDUCE_DAMAGE'},
	{stage: 'EFFECT_REMOVE_STATUS'},
	{stage: 'EFFECT_CREATE_BACKLASH'},
] as const)

/**
 * @member DEATHLOOP_REVIVE
 * @member TOTEM_REVIVE
 * @member HERMIT_ATTACK_REQUESTS: rare Evil X, rare Tango, rare King Joel, etc.
 * @member EFFECT_POST_ATTACK_REQUESTS: Chorus Fruit, Knockback, Egg
 * @member UPDATE_POST_ATTACK_STATE: Sheep Stare effect, Aussie Ping effect, Efficiency
 * @member HERMIT_REMOVE_SINGLE_USE: rare Gem, rare Poultry Man
 */
export const afterAttack = createPriorityDictionary([
	{stage: 'DEATHLOOP_REVIVE'},
	{stage: 'TOTEM_REVIVE'},
	{stage: 'HERMIT_ATTACK_REQUESTS'},
	{stage: 'EFFECT_POST_ATTACK_REQUESTS'},
	{stage: 'UPDATE_POST_ATTACK_STATE'},
	{stage: 'HERMIT_REMOVE_SINGLE_USE'},
] as const)

/**
 * @member DISCARD_SHIELD: Discards Shield
 * @member TRIGGER_GAS_LIGHT: Marks target hermit to take damage at end of turn
 * @member ON_ROW_DEATH: Loyalty and status effects handling a row knock-out
 */
export const afterDefence = createPriorityDictionary([
	{stage: 'DISCARD_SHIELD'},
	{stage: 'TRIGGER_GAS_LIGHT'},
	{stage: 'ON_ROW_DEATH'},
] as const)
