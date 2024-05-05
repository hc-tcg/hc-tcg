import {GameModel} from '../models/game-model'
import {CardPosModel} from '../models/card-pos-model'
import {StatusEffectT} from '../types/game-state'

type StatusEffectDefs = {
	id: string
	name: string
	description: string
	duration: number
	counter: boolean
	damageEffect: boolean
	visible: boolean
}

abstract class StatusEffect {
	public id: string
	public name: string
	public description: string
	public duration: number
	public counter: boolean
	public damageEffect: boolean
	public visible: boolean

	constructor(defs: StatusEffectDefs) {
		this.id = defs.id
		this.name = defs.name
		this.description = defs.description
		this.duration = defs.duration
		this.counter = defs.counter
		this.damageEffect = defs.damageEffect
		this.visible = defs.visible
	}

	public getKey(keyName: string) {
		return this.id + ':' + keyName
	}
	public getInstanceKey(instance: string, keyName: string = '') {
		return this.id + ':' + instance + ':' + keyName
	}

	/**
	 * Same as `getInstanceKey` but for the statusEffect's target
	 */
	public getTargetInstanceKey(targetId: string, instance: string, keyName: string = '') {
		return targetId + ':' + instance + ':' + keyName
	}

	/**
	 * Called when this statusEffect is applied
	 */
	public onApply(game: GameModel, statusEffectInfo: StatusEffectT, pos: CardPosModel) {
		// default is do nothing
	}

	/**
	 * Called when the statusEffect is removed, from either timeout or other means
	 */
	public onRemoval(game: GameModel, statusEffectInfo: StatusEffectT, pos: CardPosModel) {
		// default is do nothing
	}
}

export default StatusEffect
