import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../types/components'
import Card, {Item} from '../../base/card'
import {item} from '../../base/defaults'

class PvPCommonItemCard extends Card {
	props: Item = {
		...item,
		id: 'item_pvp_common',
		numericId: 61,
		name: 'PvP Item',
		shortName: 'PvP',
		expansion: 'default',
		rarity: 'common',
		tokens: 0,
		type: 'pvp',
	}

	override getEnergy(game: GameModel, component: CardComponent) {
		return [this.props.type]
	}
}

export default PvPCommonItemCard
