import {GameModel} from '../models/game-model'
import { CardPosModel } from '../models/card-pos-model'
import { AilmentT } from '../types/game-state'

type AilmentDefs = {
	id: string,
	name: string,
	description: string,
	duration: number,
	damageEffect: boolean,
}

abstract class Ailment {
	public id: string
    public name: string
	public description: string
	public duration: number
	public damageEffect: boolean

	constructor(defs: AilmentDefs) {
		this.id = defs.id
		this.name = defs.name
		this.description = defs.description
		this.duration = defs.duration
		this.damageEffect = defs.damageEffect
	}

	public getKey(keyName: string) {
		return this.id + ':' + keyName
	}
	public getInstanceKey(instance: string, keyName: string = '') {
		return this.id + ':' + instance + ':' + keyName
	}

    public onApply(game: GameModel, ailmentInfo: AilmentT, pos: CardPosModel) {
		// default is do nothing
	}

	public onRemoval(game: GameModel, ailmentInfo: AilmentT, pos: CardPosModel) {
		// default is do nothing
	}
}

export default Ailment