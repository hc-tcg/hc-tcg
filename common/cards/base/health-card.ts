import {CardRarityT} from '../../types/cards'
import Card from './card'
import {FormattedTextNode, formatText} from '../../utils/formatting'
import {slot} from '../../slot'

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

	override attachCondition = slot.nothing

	public override getFormattedDescription(): FormattedTextNode {
		return formatText(`${this.health}`)
	}
}

export default HealthCard
