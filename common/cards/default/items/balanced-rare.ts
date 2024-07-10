import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../types/game-state'
import Card, {Item, item} from '../../base/card'

class BalancedRareItemCard extends Card {
	props: Item = {
		...item,
		id: 'item_balanced_rare',
		numericId: 50,
		name: 'Balanced Item x2',
		shortName: 'Balanced',
		expansion: 'default',
		rarity: 'rare',
		tokens: 2,
		type: 'balanced',
	}

	override getEnergy(game: GameModel, instance: CardComponent, pos: CardPosModel) {
		return [this.props.type, this.props.type]
	}
}

export default BalancedRareItemCard
