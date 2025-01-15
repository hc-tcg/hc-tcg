import {
	CardComponent,
	ObserverComponent,
	PlayerComponent,
	StatusEffectComponent,
} from '../components'
import {ComponentQuery} from '../components/query'
import query from '../components/query'
import {GameModel} from '../models/game-model'

export type StatusEffectLog = {
	/** The status effect target */
	target: string
	/** The verb to use for the status effect. Either "was" or "were" depending on subject */
	verb: string
	/** The status effect name */
	statusEffect: string
}

export type StatusEffect<
	T extends CardComponent | PlayerComponent = CardComponent | PlayerComponent,
> = {
	/** The icon of the status effect, not including the file extension */
	icon: string
	name: string
	/** A unique identifier for this status effect */
	id: string
	description: string
	/** The type of the status effect.
	 * - `normal` - A status effct that can be cleared by status effect removal abilities, for example Bad Omen.
	 *              These status effects are displayed in the status effect gutters.
	 * - `damage` - Similar to `normal` status effects but also deals damage. This tag should be used when the
	 *              status effect should display on the Hermit's health box.
	 * - `system` - A status effect to provide clarity for a card ability, or to store information between rounds.
	 *              These status effects are displayed in the status effect gutters.
	 * - `hiddenSystem` - A system status effect that should not be visible to the user.
	 */
	type: 'normal' | 'damage' | 'system' | 'hiddenSystem'
	applyLog: ((values: StatusEffectLog) => string) | null
	removeLog: ((values: StatusEffectLog) => string) | null
	applyCondition: ComponentQuery<CardComponent | PlayerComponent>
	counter?: number
	/**
	 * Called when this statusEffect has its target set
	 */
	onApply(
		_game: GameModel,
		_effect: StatusEffectComponent,
		_target: T,
		_observer: ObserverComponent,
	): void
	/**
	 * Called when the statusEffect is removed, from either timeout or other means
	 */
	onRemoval(
		_game: GameModel,
		_effect: StatusEffectComponent,
		_target: T,
		_observer: ObserverComponent,
	): void
}

export type Counter<
	T extends CardComponent | PlayerComponent = CardComponent | PlayerComponent,
> = StatusEffect<T> & {
	counter: number
	counterType: 'turns' | 'number'
}

export const statusEffect = {
	type: 'normal' as StatusEffect['type'],
	applyCondition: query.anything,
	applyLog: (values: StatusEffectLog) =>
		`${values.target} ${values.verb} inflicted with ${values.statusEffect}`,
	removeLog: (values: StatusEffectLog) =>
		`${values.statusEffect} on ${values.target} wore off`,
	onApply(
		_game: GameModel,
		_effect: StatusEffectComponent,
		_target: CardComponent | PlayerComponent,
		_observer: ObserverComponent,
	) {},
	onRemoval(
		_game: GameModel,
		_effect: StatusEffectComponent,
		_target: CardComponent | PlayerComponent,
		_observer: ObserverComponent,
	) {},
}

export const systemStatusEffect = {
	...statusEffect,
	type: 'system' as StatusEffect['type'],
	applyCondition: query.anything,
	applyLog: null,
	removeLog: null,
}

export const hiddenStatusEffect = {
	...statusEffect,
	type: 'hiddenSystem' as StatusEffect['type'],
	icon: '',
	description: '',
	name: '',
	applyCondition: query.anything,
	applyLog: null,
	removeLog: null,
}

export const damageEffect = {
	...statusEffect,
	type: 'damage' as StatusEffect['type'],
	applyCondition: (game: GameModel, target: CardComponent | PlayerComponent) =>
		target instanceof CardComponent &&
		!game.components.exists(
			StatusEffectComponent,
			query.effect.targetEntity(target.entity),
			query.effect.type('damage'),
		),
	applyLog: (values: StatusEffectLog) =>
		`${values.target} was inflicted with ${values.statusEffect}`,
	removeLog: (values: StatusEffectLog) =>
		`${values.statusEffect} on ${values.target} wore off`,
}

export function isCounter<T extends CardComponent | PlayerComponent>(
	effect: StatusEffect<T>,
): effect is Counter<T> {
	return effect.counter !== undefined && 'counterType' in effect
}
