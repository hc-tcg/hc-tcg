import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../types/components'
import Card, {Item} from '../../base/card'
import {item} from '../../base/defaults'

class PranksterRareItemCard extends Card {
	props: Item = {
		...item,
		id: 'item_prankster_rare',
		numericId: 60,
		name: 'Prankster Item x2',
		shortName: 'Prankster',
		expansion: 'default',
		rarity: 'rare',
		tokens: 2,
		type: 'prankster',
	}

	override getEnergy(game: GameModel, component: CardComponent) {
		return [this.props.type, this.props.type]
	}
}

export default PranksterRareItemCard
