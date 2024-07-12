import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../components/components'
import Card, {Item} from '../../base/card'
import {item} from '../../base/defaults'

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

	override getEnergy(game: GameModel, component: CardComponent) {
		return [this.props.type, this.props.type]
	}
}

export default BalancedRareItemCard
