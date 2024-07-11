import {GameModel} from '../models/game-model'
import {CardPosModel} from '../models/card-pos-model'
import {StatusEffectInstance} from '../types/game-state'
import {SlotCondition, slot} from '../slot'
import {SlotInfo} from '../types/cards'

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
	type: 'normal' | 'damage' | 'system' | 'hidden'
	applyLog: ((values: StatusEffectLog) => string) | null
	removeLog: ((values: StatusEffectLog) => string) | null
	applyCondition: SlotCondition
}

export type Counter = StatusEffectProps & {
	counter: number
	counterType: 'turns' | 'number'
}

export const statusEffect = {
	type: 'normal' as StatusEffectProps['type'],
	applyCondition: slot.anything,
	applyLog: (values: StatusEffectLog) =>
		`${values.target} was inflicted with ${values.statusEffect}`,
	removeLog: (values: StatusEffectLog) => `${values.statusEffect} on ${values.target} wore off`,
}

export const systemStatusEffect = {
	type: 'system' as StatusEffectProps['type'],
	applyCondition: slot.anything,
	applyLog: null,
	removeLog: null,
}

export const hiddenStatusEffect = {
	type: 'hidden' as StatusEffectProps['type'],
	name: '',
	description: '',
	applyCondition: slot.anything,
	applyLog: null,
	removeLog: null,
}

export const damageEffect = {
	type: 'damage' as StatusEffectProps['type'],
	applyCondition: (game: GameModel, pos: SlotInfo) =>
		game.state.statusEffects.every(
			(a) => a.targetInstance.instance !== pos.card?.instance || a.props.type === 'damage'
		),
	applyLog: (values: StatusEffectLog) =>
		`${values.target} was inflicted with ${values.statusEffect}`,
	removeLog: (values: StatusEffectLog) => `${values.statusEffect} on ${values.target} wore off`,
}

export function isCounter(props: StatusEffectProps | null): props is Counter {
	return props !== null && 'counter' in props
}

/** Returns a function that can be hooked to onActiveRowChange. */
export function followActiveHermit(game: GameModel, instance: StatusEffectInstance) {
	return (_: number | null, newRow: number | null) => {
		if (newRow === null) return
		let newHermit = game.currentPlayer.board.rows[newRow].hermitCard
		if (!newHermit) return

		instance.targetInstance = newHermit
	}
}

abstract class StatusEffect<Props extends StatusEffectProps = StatusEffectProps> {
	public abstract props: Props

	public getKey(keyName: string) {
		return this.props.id + ':' + keyName
	}

	public getInstanceKey(instance: StatusEffectInstance, keyName: string = '') {
		return this.props.id + ':' + instance.instance + ':' + keyName
	}

	/**
	 * Called when this statusEffect is applied
	 */
	public onApply(game: GameModel, instance: StatusEffectInstance, pos: CardPosModel) {
		// default is do nothing
	}

	/**
	 * Called when the statusEffect is removed, from either timeout or other means
	 */
	public onRemoval(game: GameModel, instance: StatusEffectInstance, pos: CardPosModel) {
		// default is do nothing
	}
}

export default StatusEffect
