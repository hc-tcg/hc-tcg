import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../components'
import Card from '../../base/card'
import {Description, Item} from '../../base/types'
import {item} from '../../base/defaults'

class PranksterDoubleItem extends Card {
	props: Item & Description = {
		...item,
		id: 'item_prankster_rare',
		numericId: 60,
		name: 'Prankster Item x2',
		shortName: 'Prankster',
		description: 'Counts as 2 Prankster Item cards.',
		expansion: 'default',
		rarity: 'rare',
		tokens: 2,
		type: 'prankster',
	}

	override getEnergy(game: GameModel, component: CardComponent) {
		return [this.props.type, this.props.type]
	}
}

export default PranksterDoubleItem
