import {GameModel} from '../models/game-model'
import {ComponentQuery, effect, query} from '../components/query'
import {CardComponent, StatusEffectComponent} from '../components'
import {ObserverComponent} from '../types/hooks'

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
			effect.targetIs(target.entity),
			effect.type('damage')
		),
	applyLog: (values: StatusEffectLog) =>
		`${values.target} was inflicted with ${values.statusEffect}`,
	removeLog: (values: StatusEffectLog) => `${values.statusEffect} on ${values.target} wore off`,
}

export function isCounter(props: StatusEffectProps | null): props is Counter {
	return props !== null && 'counter' in props
}

abstract class StatusEffect<Props extends StatusEffectProps = StatusEffectProps> {
	public abstract props: Props

	/**
	 * Called when this statusEffect has its target set
	 */
	public onApply(
		game: GameModel,
		component: StatusEffectComponent,
		target: CardComponent,
		observer: ObserverComponent
	) {
		// default is do nothing
	}

	/**
	 * Called when the statusEffect is removed, from either timeout or other means
	 */
	public onRemoval(
		game: GameModel,
		component: StatusEffectComponent,
		target: CardComponent,
		observer: ObserverComponent
	) {
		// default is do nothing
	}
}

export default StatusEffect
