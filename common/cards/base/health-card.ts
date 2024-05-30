import {GameModel} from '../../models/game-model'
import {CardRarityT} from '../../types/cards'
import Card from './card'
import {CardPosModel} from '../../models/card-pos-model'
import {FormattedTextNode, formatText} from '../../utils/formatting'

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
			numericId: -1,
			name: defs.name,
			rarity: defs.rarity,
		})

		this.health = defs.health
	}

	public override canAttach(game: GameModel, pos: CardPosModel) {
		return []
	}

	public override getFormattedDescription(): FormattedTextNode {
		return formatText(`${this.health}`)
	}
}

export default HealthCard
