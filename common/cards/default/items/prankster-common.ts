import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../components'
import Card from '../../base/card'
import {Item} from '../../base/types'
import {item} from '../../base/defaults'

class PranksterCommonItemCard extends Card {
	props: Item = {
		...item,
		id: 'item_prankster_common',
		numericId: 59,
		name: 'Prankster Item',
		shortName: 'Prankster',
		expansion: 'default',
		rarity: 'common',
		tokens: 0,
		type: 'prankster',
	}

	override getEnergy(game: GameModel, component: CardComponent) {
		return [this.props.type]
	}
}

export default PranksterCommonItemCard
