import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../components/components'
import Card, {Item} from '../../base/card'
import {item} from '../../base/defaults'

class BuilderCommonItemCard extends Card {
	props: Item = {
		...item,
		id: 'item_builder_common',
		numericId: 51,
		name: 'Builder Item',
		shortName: 'Builder',
		expansion: 'default',
		rarity: 'common',
		tokens: 0,
		type: 'builder',
	}

	override getEnergy(game: GameModel, component: CardComponent) {
		return [this.props.type]
	}
}

export default BuilderCommonItemCard
