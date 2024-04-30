import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {CanAttachResult} from '../../base/card'
import SingleUseCard from '../../base/single-use-card'

class FletchingTableSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'fletching_table',
			numericId: 223,
			name: 'Fletching table',
			rarity: 'common',
			description: 'Completely useless! Worth -1 tokens.',
		})
	}

	public override canAttach(game: GameModel, pos: CardPosModel): CanAttachResult {
		return ['INVALID_SLOT']
	}

	public override getExpansion(): string {
		return 'advent_of_tcg'
	}
}

export default FletchingTableSingleUseCard
