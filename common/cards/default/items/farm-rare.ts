import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../components'
import Card, {Item} from '../../base/card'
import {item} from '../../base/defaults'

class FarmRareItemCard extends Card {
	props: Item = {
		...item,
		id: 'item_farm_rare',
		numericId: 56,
		name: 'Farm Item x2',
		shortName: 'Farm',
		expansion: 'default',
		rarity: 'rare',
		tokens: 2,
		type: 'farm',
	}

	override getEnergy(game: GameModel, component: CardComponent) {
		return [this.props.type, this.props.type]
	}
}

export default FarmRareItemCard
