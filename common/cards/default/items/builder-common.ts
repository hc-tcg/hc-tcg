import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../types/game-state'
import Card, {Item, item} from '../../base/card'

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

	override getEnergy(game: GameModel, instance: CardComponent, pos: CardPosModel) {
		return [this.props.type]
	}
}

export default BuilderCommonItemCard
