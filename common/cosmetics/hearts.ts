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
		id: 'gold',
		name: 'Gold',
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
