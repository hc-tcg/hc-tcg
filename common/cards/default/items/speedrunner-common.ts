import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../components'
import Card from '../../base/card'
import {Item} from '../../base/types'
import {item} from '../../base/defaults'

class SpeedrunnerCommonItemCard extends Card {
	props: Item = {
		...item,
		id: 'item_speedrunner_common',
		numericId: 65,
		name: 'Speedrunner Item',
		shortName: 'Speedrunner',
		expansion: 'default',
		rarity: 'common',
		tokens: 0,
		type: 'speedrunner',
	}

	override getEnergy(game: GameModel, component: CardComponent) {
		return [this.props.type]
	}
}

export default SpeedrunnerCommonItemCard
