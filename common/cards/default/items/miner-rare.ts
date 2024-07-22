import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../components'
import Card from '../../base/card'
import {Description, Item} from '../../base/types'
import {item} from '../../base/defaults'

class MinerDoubleItem extends Card {
	props: Item & Description = {
		...item,
		id: 'item_miner_rare',
		numericId: 58,
		name: 'Miner Item x2',
		shortName: 'Miner',
		description: 'Counts as 2 Miner Item cards.',
		expansion: 'default',
		rarity: 'rare',
		tokens: 2,
		type: 'miner',
	}

	override getEnergy(game: GameModel, component: CardComponent) {
		return [this.props.type, this.props.type]
	}
}

export default MinerDoubleItem
