import query from '../../../components/query'
import {singleUse} from '../../base/defaults'
import {SingleUse} from '../../base/types'

const FletchingTable: SingleUse = {
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

export default FletchingTable
