import {slot} from '../../../components/query'
import Card, {SingleUse, singleUse} from '../../base/card'

class FletchingTableSingleUseCard extends Card {
	props: SingleUse = {
		...singleUse,
		id: 'fletching_table',
		numericId: 223,
		name: 'Fletching table',
		expansion: 'advent_of_tcg',
		rarity: 'common',
		tokens: -1,
		description: 'Completely useless! Worth -1 tokens.',
		attachCondition: slot.nothing,
	}
}

export default FletchingTableSingleUseCard
