import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../components'
import Card from '../../base/card'
import {Description, Item} from '../../base/types'
import {item} from '../../base/defaults'

class SpeedrunnerDoubleItem extends Card {
	props: Item & Description = {
		...item,
		id: 'item_speedrunner_rare',
		numericId: 66,
		name: 'Speedrunner Item x2',
		shortName: 'Speedrunner',
		description: 'Counts as 2 Speedrunner Item cards.',
		expansion: 'default',
		rarity: 'rare',
		tokens: 2,
		type: 'speedrunner',
	}

	override getEnergy(game: GameModel, component: CardComponent) {
		return [this.props.type, this.props.type]
	}
}

export default SpeedrunnerDoubleItem
