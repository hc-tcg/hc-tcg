import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {CardInstance} from '../../../types/game-state'
import Card, {Item, item} from '../../base/card'

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

	override getEnergy(game: GameModel, instance: CardInstance, pos: CardPosModel) {
		return [this.props.type]
	}
}

export default BalancedCommonItemCard
