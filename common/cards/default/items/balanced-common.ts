import {GameModel} from '../../../models/game-model'
import { CardComponent } from '../../../components'
import Card from '../../base/card'
import {Item} from '../../base/types'
import { item } from '../../base/defaults'

class BalancedCommonItemCard extends Card {
	props: Item = {
		...item,
		id: 'item_balanced_common',
		numericId: 49,
		name: 'Balanced Item',
		shortName: 'Balanced',
		expansion: 'default',
		rarity: 'common',
		tokens: 0,
		type: 'balanced',
	}

	override getEnergy(game: GameModel, component: CardComponent) {
		return [this.props.type]
	}
}

export default BalancedCommonItemCard
