import {GameModel} from '../models/game-model'
import {CardPosModel} from '../models/card-pos-model'
import {CardComponent, StatusEffectComponent} from '../types/game-state'
import {SlotCondition, effect, slot} from '../filters'
import {SlotComponent} from '../types/cards'

export type StatusEffectProps = {
	id: string
	name: string
	description: string
	damageEffect?: boolean
	applyCondition: SlotCondition
	hidden?: boolean
}

export type Counter = StatusEffectProps & {
	counter: number
	counterType: 'turns' | 'number'
}

export const statusEffect = {
	damageEffect: false,
	applyCondition: slot.anything,
}

export const hiddenStatusEffect = {
	hidden: true,
	name: '',
	description: '',
	applyCondition: slot.anything,
}

export const damageEffect = {
	damageEffect: true,
	applyCondition: (game: GameModel, card: CardComponent) =>
		!game.state.statusEffects.somethingFulfills(effect.target(card.entity), effect.damageEffect),
}

export function isCounter(props: StatusEffectProps | null): props is Counter {
	return props !== null && 'counter' in props
}

abstract class StatusEffect<Props extends StatusEffectProps = StatusEffectProps> {
	public abstract props: Props

	/**
	 * Called when this statusEffect has its target set
	 */
	public onApply(game: GameModel, component: StatusEffectComponent, target: CardComponent) {
		// default is do nothing
	}

	/**
	 * Called when the statusEffect is removed, from either timeout or other means
	 */
	public onRemoval(game: GameModel, component: StatusEffectComponent, target: CardComponent) {
		// default is do nothing
	}
}

export default StatusEffect
