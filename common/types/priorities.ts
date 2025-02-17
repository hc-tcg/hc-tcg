export type PrioritiesT = Record<string, null>
export type Priority<T extends PrioritiesT> = number & {
	__priority_type_do_not_use_or_program_will_crash: T
}
/** Warning! Typescript can not differentiate between dictionaries with the same keys in different orders
 *  @example {A: null, B: null} <=> {B: null, A: null} */
export type PriorityDict<T extends PrioritiesT> = {
	readonly [stage in keyof T]: Priority<T>
}
export type PrioritySrc<T> = T extends PriorityDict<infer Priorities>
	? Priorities
	: never

function createPriorityDictionary<T extends PrioritiesT>(
	priorities: T,
): PriorityDict<T> {
	const stages = Object.keys(priorities) as Array<keyof T & string>
	return stages.reduce(
		(r, stage, i) => {
			r[stage] = i
			return r
		},
		{} as Record<string, number>,
	) as any
}

export const beforeAttack = createPriorityDictionary({
	/** Listeners adding queries to `attack.shouldIgnoreCards` */
	IGNORE_CARDS: null,
	/** Hermit cards updating the intended target of attacks created with a default target */
	HERMIT_SET_TARGET: null,
	/** Betrayed effect setting what target should be attacked instead, see also `beforeAttack.SHEEP_STARE_CHANGE_TARGET` */
	BETRAYED_CHANGE_TARGET: null,
	/** Sheep Stare effect setting what target should be attacked instead, Sheep Stare can overrule Betrayed in AoTCG */
	SHEEP_STARE_CHANGE_TARGET: null,
	/** Lightning Rod redirecting all damage from attacks */
	LIGHTNING_ROD_REDIRECT: null,
	/** Target Block redirecting all damage from attacks, effect overrules Lightning Rod  */
	TARGET_BLOCK_REDIRECT: null,
	/** Effects, Hermits, and Status Effects that add additional attacks or adjust damage of the main attack. */
	ADD_ATTACK: null,
	/** Effects, Hermits, and Status Effects that modify damage of additional attacks along with the main attack.  */
	MODIFY_DAMAGE: null,
	/** Listeners that call after damage modifiers are applied.  */
	RESOLVE_AFTER_MODIFIERS: null,
	/** Hermit attack abilities that modify state before any damage is dealt */
	HERMIT_APPLY_ATTACK: null,
	/** Any attacking single-use cards must call `applySingleUse` at this stage */
	APPLY_SINGLE_USE_ATTACK: null,
	/** Hermits blocking all damage done by certain attacks */
	HERMIT_BLOCK_DAMAGE: null,
	/** Effect cards blocking all damage done by certain attacks */
	EFFECT_BLOCK_DAMAGE: null,
	/** Weakness effect modifying an attack to always create a weakness attack */
	FORCE_WEAKNESS_ATTACK: null,
	/** Effect cards can reduce the final damage of attacks */
	EFFECT_REDUCE_DAMAGE: null,
	/** Effects such as buckets can remove status effects created by an attack */
	EFFECT_REMOVE_STATUS: null,
	/** Trapdoor intercepting damage from an adjacent row */
	TRAPDOOR_INTERCEPT_DAMAGE: null,
	/** Listeners reacting to the whether the attack's target will be damaged */
	REACT_TO_DAMAGE: null,
})

export const rowRevive = createPriorityDictionary({
	/** Deathloop may revive their row (does not trigger an attached Totem when present) */
	DEATHLOOP_REVIVE: null,
	/** Totems may revive their row and be discarded */
	TOTEM_REVIVE: null,
})

export const afterAttack = createPriorityDictionary({
	/** Hermit attacks add any requests dependent on the new board state */
	HERMIT_ATTACK_REQUESTS: null,
	/** Effect cards that take effect after attacking can add their requests */
	EFFECT_POST_ATTACK_REQUESTS: null,
	/** Listeners updating board or private state after attacks executed */
	UPDATE_POST_ATTACK_STATE: null,
	/** Evil Xisuma Boss reviving itself after state updates from knockout */
	BOSS_HANDLE_KNOCKOUT: null,
	/** When it is safe for Hermit attacks to remove the card in the single use slot */
	HERMIT_REMOVE_SINGLE_USE: null,
	/** All hermit attack logic should occur before this, to support mocking with Puppetry/Role Play */
	DESTROY_MOCK_CARD: null,
})

export const onTurnEnd = createPriorityDictionary({
	/** Similar to afterAttack.DESTROY_MOCK_CARD */
	DESTROY_MOCK_CARD: null,
	/** Trigger before status effects time out */
	BEFORE_STATUS_EFFECT_TIMEOUT: null,
	/** End of the turn, when status effects are supposed to timeout. */
	ON_STATUS_EFFECT_TIMEOUT: null,
})

export const onCoinFlip = createPriorityDictionary({
	/* Priority for Bad Omen */
	BAD_OMEN: null,
	/* Priority for Fortune and Spent Fortune status effect */
	FORTUNE: null,
})
