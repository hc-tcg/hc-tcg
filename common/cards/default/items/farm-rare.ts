import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../types/game-state'
import Card, {Item, item} from '../../base/card'

class FarmRareItemCard extends Card {
	props: Item = {
		...item,
		id: 'item_farm_rare',
		numericId: 56,
		name: 'Farm Item x2',
		shortName: 'Farm',
		expansion: 'default',
		rarity: 'rare',
		tokens: 2,
		type: 'farm',
	}

	override getEnergy(game: GameModel, instance: CardComponent, pos: CardPosModel) {
		return [this.props.type, this.props.type]
	}
}

export default FarmRareItemCard
