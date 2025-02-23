import DeckedOut from '../achievements/decked-out'
import SUStainable from '../achievements/sustainable'
import Untouchable from '../achievements/untouchable'
import {Win1000} from '../achievements/wins'
import {Heart} from './types'

const HeartDefinitions: Omit<Heart, 'type'>[] = [
	{
		id: 'red',
		name: 'Default',
	},
	{
		id: 'gold',
		name: 'Gold',
		requires: Win1000.id,
	},
	{
		id: 'emerald',
		name: 'Emerald',
		requires: SUStainable.id,
	},
	{
		id: 'silver_heart',
		name: 'Silver',
		requires: Untouchable.id,
	},
	{
		id: 'soulflame',
		name: 'Soulflame',
		requires: DeckedOut.id,
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
