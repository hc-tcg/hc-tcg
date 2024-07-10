import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../types/game-state'
import Card, {Item, item} from '../../base/card'

class BuilderRareItemCard extends Card {
	props: Item = {
		...item,
		id: 'item_builder_rare',
		numericId: 52,
		name: 'Builder Item x2',
		shortName: 'Builder',
		expansion: 'default',
		rarity: 'rare',
		tokens: 2,
		type: 'builder',
	}

	override getEnergy(game: GameModel, instance: CardComponent, pos: CardPosModel) {
		return [this.props.type, this.props.type]
	}
}

export default BuilderRareItemCard
