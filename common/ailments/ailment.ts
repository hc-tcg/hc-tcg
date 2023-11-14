import {GameModel} from '../models/game-model'
import {CardPosModel} from '../models/card-pos-model'
import {AilmentT} from '../types/game-state'

type AilmentDefs = {
	id: string
	name: string
	description: string
	duration: number
	counter: boolean
	damageEffect: boolean
}

abstract class Ailment {
	public id: string
	public name: string
	public description: string
	public duration: number
	public counter: boolean
	public damageEffect: boolean

	constructor(defs: AilmentDefs) {
		this.id = defs.id
		this.name = defs.name
		this.description = defs.description
		this.duration = defs.duration
		this.counter = defs.counter
		this.damageEffect = defs.damageEffect
	}

	public getKey(keyName: string) {
		return this.id + ':' + keyName
	}
	public getInstanceKey(instance: string, keyName: string = '') {
		return this.id + ':' + instance + ':' + keyName
	}

	/**
	 * Same as `getInstanceKey` but for the ailment's target
	 */
	public getTargetInstanceKey(targetId: string, instance: string, keyName: string = '') {
		return targetId + ':' + instance + ':' + keyName
	}

	/**
	 * Called when this ailment is applied
	 */
	public onApply(game: GameModel, ailmentInfo: AilmentT, pos: CardPosModel) {
		// default is do nothing
	}

	/**
	 * Called when the ailment is removed, from either timeout or other means
	 */
	public onRemoval(game: GameModel, ailmentInfo: AilmentT, pos: CardPosModel) {
		// default is do nothing
	}
}

export default Ailment
