import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../components'
import Card, {Item} from '../../base/card'
import {item} from '../../base/defaults'

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

	override getEnergy(game: GameModel, component: CardComponent) {
		return [this.props.type]
	}
}

export default MinerCommonItemCard
