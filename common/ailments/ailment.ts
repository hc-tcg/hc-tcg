import {GameModel} from '../models/game-model'
import { CardPosModel } from '../models/card-pos-model'
import { AilmentT } from '../types/game-state'

type AilmentDefs = {
	id: string,
    name: string,
	duration: number,
}

abstract class Ailment {
	public id: string
    public name: string
	public duration: number

	constructor(defs: AilmentDefs) {
		this.id = defs.id
        this.name = defs.name
		this.duration = defs.duration
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