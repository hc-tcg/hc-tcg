import SUStainable from '../achievements/sustainable'
import Win from '../achievements/wins'
import {Heart} from './types'

const HeartDefinitions: Omit<Heart, 'type'>[] = [
	{
		id: 'red',
		name: 'Default',
	},
	{
		id: 'soulflame',
		name: 'Soulflame',
	},
	{
		id: 'silver_heart',
		name: 'Silver',
	},
	{
		id: 'emerald',
		name: 'Emerald',
		requires: {achievement: SUStainable.id},
	},
	{
		id: 'gold',
		name: 'Gold',
		requires: {achievement: Win.id, level: 4},
	},
]

export const ALL_HEARTS: Heart[] = HeartDefinitions.map((heart) => ({
	type: 'heart',
	...heart,
}))

export const HEARTS: Record<string | number, Heart> = ALL_HEARTS.reduce(
	(result: Record<string | number, Heart>, card) => {
		result[card.id] = card
		return result
	},
	{},
)
