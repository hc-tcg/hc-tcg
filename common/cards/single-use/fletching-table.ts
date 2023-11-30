import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import SingleUseCard from '../base/single-use-card'

class FletchingTableSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'fletching_table',
			numericId: 153,
			name: 'Fletching table',
			rarity: 'common',
			description: 'Completely useless! Worth -1 tokens.',
		})
	}

	public override canAttach(game: GameModel, pos: CardPosModel): 'YES' | 'NO' | 'INVALID' {
		return 'NO'
	}

	public override getExpansion(): string {
		return 'advent_of_tcg'
	}
}

export default FletchingTableSingleUseCard
