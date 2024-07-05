import {GameModel} from '../models/game-model'
import {CardPosModel} from '../models/card-pos-model'
import {StatusEffectInstance} from '../types/game-state'

export type StatusEffectProps = {
	id: string
	name: string
	description: string
	damageEffect: boolean
}

export type Counter = StatusEffectProps & {
	counter: number
}

export function isCounter(props: StatusEffect<StatusEffectProps>): props is StatusEffect<Counter>
export function isCounter(props: StatusEffectProps): props is Counter
export function isCounter(
	props: StatusEffectProps | StatusEffect<StatusEffectProps> | null
): props is Counter {
	return props !== null && 'counter' in props
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
	public onApply(game: GameModel, statusEffectInfo: StatusEffectInstance, pos: CardPosModel) {
		// default is do nothing
	}

	/**
	 * Called when the statusEffect is removed, from either timeout or other means
	 */
	public onRemoval(game: GameModel, statusEffectInfo: StatusEffectInstance, pos: CardPosModel) {
		// default is do nothing
	}
}

export default StatusEffect
