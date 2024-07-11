import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../types/game-state'
import Card, {Item, item} from '../../base/card'

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
