import {GameModel} from '../../models/game-model'
import {CardRarityT} from '../../types/cards'
import Card from './card'
import {PickRequirmentT} from '../../types/pick-process'
import {CardPosModel} from '../../models/card-pos-model'

type HealthDefs = {
	id: string
	name: string
	rarity: CardRarityT
	health: number
}

// @TODO extending card does not really make sense for this

class HealthCard extends Card {
	public health: number
	constructor(defs: HealthDefs) {
		super({
			type: 'health',
			id: defs.id,
			numeric_id: -1,
			name: defs.name,
			rarity: defs.rarity,
		})

		this.health = defs.health
	}

	public override canAttach(game: GameModel, pos: CardPosModel): 'YES' | 'NO' | 'INVALID' {
		return 'YES'
	}
}

export default HealthCard
