import {GameModel} from '../../models/game-model'
import {CardRarityT} from '../../types/cards'
import Card, { CardProps } from './card'
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
	props: CardProps = {
		type: 'health',
		id: 'health',
		expansion: 'default',
		numericId: -1,
		tokens: -1,
		name: 'Health Card',
		rarity: 'common',
	}

	health = 0
	
	public override getFormattedDescription(): FormattedTextNode {
		return formatText(`${this.health}`)
	}
}

export default HealthCard
