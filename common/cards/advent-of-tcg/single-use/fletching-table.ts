import {query, slot} from '../../../components/query'
import Card from '../../base/card'
import {SingleUse} from '../../base/types'
import {singleUse} from '../../base/defaults'

class FletchingTable extends Card {
	props: SingleUse = {
		...singleUse,
		id: 'fletching_table',
		numericId: 223,
		name: 'Fletching table',
		expansion: 'advent_of_tcg',
		rarity: 'common',
		tokens: -1,
		description: 'Completely useless! Worth -1 tokens.',
		attachCondition: query.nothing,
	}
}

export default FletchingTable
