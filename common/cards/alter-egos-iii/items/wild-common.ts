import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../components'
import Card from '../../base/card'
import {Description, Item} from '../../base/types'
import {item} from '../../base/defaults'

class WildItem extends Card {
	props: Item & Description = {
		...item,
		id: 'item_any_common',
		numericId: 185,
		name: 'Wild Item',
		description: 'Counts as any single Item card.',
		shortName: 'Wild',
		expansion: 'alter_egos_ii',
		rarity: 'common',
		tokens: 1,
		type: 'any',
	}

	override getEnergy(game: GameModel, component: CardComponent) {
		return [this.props.type]
	}
}

export default WildItem
