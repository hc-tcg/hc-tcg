import {slot} from '../../../slot'
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

	override _attachCondition = slot.nothing

	public override getExpansion(): string {
		return 'advent_of_tcg'
	}
}

export default FletchingTableSingleUseCard
