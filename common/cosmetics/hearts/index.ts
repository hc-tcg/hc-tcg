import {Heart} from '../types'
import GoldHearts from './gold'
import RedHearts from './red'

export const ALL_HEARTS: Heart[] = [RedHearts, GoldHearts]

export const HEARTS: Record<string | number, Heart> = ALL_HEARTS.reduce(
	(result: Record<string | number, Heart>, card) => {
		result[card.id] = card
		return result
	},
	{},
)
