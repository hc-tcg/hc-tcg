import {Heart} from '../types'
import GoldHearts from './gold'
import RedHearts from './red'
import SoulflameHearts from './soulflame'

export const ALL_HEARTS: Heart[] = [RedHearts, GoldHearts, SoulflameHearts]

export const HEARTS: Record<string | number, Heart> = ALL_HEARTS.reduce(
	(result: Record<string | number, Heart>, card) => {
		result[card.id] = card
		return result
	},
	{},
)
