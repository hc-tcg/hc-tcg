import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {CardInstance} from '../../../types/game-state'
import Card, {Item, item} from '../../base/card'

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

	override getEnergy(game: GameModel, instance: CardInstance, pos: CardPosModel) {
		return [this.props.type]
	}
}

export default PranksterCommonItemCard
