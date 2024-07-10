import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../types/game-state'
import Card, {Item, item} from '../../base/card'

class SpeedrunnerRareItemCard extends Card {
	props: Item = {
		...item,
		id: 'item_speedrunner_rare',
		numericId: 66,
		name: 'Speedrunner Item x2',
		shortName: 'Speedrunner',
		expansion: 'default',
		rarity: 'rare',
		tokens: 2,
		type: 'speedrunner',
	}

	override getEnergy(game: GameModel, instance: CardComponent, pos: CardPosModel) {
		return [this.props.type, this.props.type]
	}
}

export default SpeedrunnerRareItemCard
