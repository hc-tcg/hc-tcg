import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../components'
import Card from '../../base/card'
import {Item} from '../../base/types'
import {item} from '../../base/defaults'

class PvPDoubleItem extends Card {
	props: Item = {
		...item,
		id: 'item_pvp_rare',
		numericId: 62,
		name: 'PvP Item x2',
		shortName: 'PvP',
		expansion: 'default',
		rarity: 'rare',
		tokens: 2,
		type: 'pvp',
	}

	override getEnergy(game: GameModel, component: CardComponent) {
		return [this.props.type, this.props.type]
	}
}

export default PvPDoubleItem
