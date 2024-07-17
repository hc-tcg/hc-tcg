import {GameModel} from '../models/game-model'
import {ComponentQuery} from '../components/query'
import * as query from '../components/query'
import {
	CardComponent,
	ObserverComponent,
	PlayerComponent,
	StatusEffectComponent,
} from '../components'

export type StatusEffectLog = {
	/** The status effect target */
	target: string
	/** The status effect name */
	statusEffect: string
}

export type StatusEffectProps = {
	id: string
	name: string
	description: string
	type: 'normal' | 'damage' | 'system' | 'hiddenSystem'
	applyLog: ((values: StatusEffectLog) => string) | null
	removeLog: ((values: StatusEffectLog) => string) | null
	applyCondition: ComponentQuery<CardComponent>
}

export type Counter = StatusEffectProps & {
	counter: number
	counterType: 'turns' | 'number'
}

export const statusEffect = {
	type: 'normal' as StatusEffectProps['type'],
	applyCondition: query.anything,
	applyLog: (values: StatusEffectLog) =>
		`${values.target} was inflicted with ${values.statusEffect}`,
	removeLog: (values: StatusEffectLog) => `${values.statusEffect} on ${values.target} wore off`,
}

export const systemStatusEffect = {
	type: 'system' as StatusEffectProps['type'],
	applyCondition: query.anything,
	applyLog: null,
	removeLog: null,
}

export const hiddenStatusEffect = {
	type: 'hiddenSystem' as StatusEffectProps['type'],
	name: '',
	description: '',
	applyCondition: query.anything,
	applyLog: null,
	removeLog: null,
}

export const damageEffect = {
	type: 'damage' as StatusEffectProps['type'],
	applyCondition: (game: GameModel, target: CardComponent) =>
		!game.components.exists(
			StatusEffectComponent,
			query.effect.targetIs(target.entity),
			query.effect.type('damage')
		),
	applyLog: (values: StatusEffectLog) =>
		`${values.target} was inflicted with ${values.statusEffect}`,
	removeLog: (values: StatusEffectLog) => `${values.statusEffect} on ${values.target} wore off`,
}

export function isCounter(props: StatusEffectProps | null): props is Counter {
	return props !== null && 'counter' in props
}

export abstract class StatusEffect<
	T = CardComponent | PlayerComponent,
	Props extends StatusEffectProps = StatusEffectProps,
> {
	public abstract props: Props

	/**
	 * Called when this statusEffect has its target set
	 */
	public onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		target: T,
		observer: ObserverComponent
	) {
		// default is do nothing
	}

	/**
	 * Called when the statusEffect is removed, from either timeout or other means
	 */
	public onRemoval(
		game: GameModel,
		effect: StatusEffectComponent,
		target: T,
		observer: ObserverComponent
	) {
		// default is do nothing
	}
}

export abstract class CardStatusEffect extends StatusEffect<CardComponent> {
	/**
	 * Called when this statusEffect has its target set
	 */
	override onApply(
		game: GameModel,
		effect: StatusEffectComponent<CardComponent>,
		target: CardComponent,
		observer: ObserverComponent
	) {
		// default is do nothing
	}

	/**
	 * Called when the statusEffect is removed, from either timeout or other means
	 */
	override onRemoval(
		game: GameModel,
		effect: StatusEffectComponent<CardComponent>,
		target: CardComponent,
		observer: ObserverComponent
	) {
		// default is do nothing
	}
}

export abstract class PlayerStatusEffect extends StatusEffect<PlayerComponent> {
	/**
	 * Called when this statusEffect has its target set
	 */
	override onApply(
		game: GameModel,
		effect: StatusEffectComponent<PlayerComponent>,
		player: PlayerComponent,
		observer: ObserverComponent
	) {
		// default is do nothing
	}

	/**
	 * Called when the statusEffect is removed, from either timeout or other means
	 */
	override onRemoval(
		game: GameModel,
		effect: StatusEffectComponent<PlayerComponent>,
		player: PlayerComponent,
		observer: ObserverComponent
	) {
		// default is do nothing
	}
}
