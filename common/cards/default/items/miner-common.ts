import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {CardInstance} from '../../../types/game-state'
import Card, {Item, item} from '../../base/card'

class MinerCommonItemCard extends Card {
	props: Item = {
		...item,
		id: 'item_miner_common',
		numericId: 57,
		name: 'Miner Item',
		shortName: 'Miner',
		expansion: 'default',
		rarity: 'common',
		tokens: 0,
		type: 'miner',
	}

	override getEnergy(game: GameModel, instance: CardInstance, pos: CardPosModel) {
		return [this.props.type]
	}
}

export default MinerCommonItemCard
