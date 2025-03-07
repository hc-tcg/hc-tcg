import CantTouchThis from '../achievements/cant-touch-this'
import DeckedOut from '../achievements/decked-out'
import SUStainable from '../achievements/sustainable'
import Channeling from '../achievements/targeted-lightning'
import Win from '../achievements/wins'
import {Heart} from './types'

const HeartDefinitions: Omit<Heart, 'type'>[] = [
	{
		id: 'red',
		name: 'Default',
	},
	{
		id: 'copper',
		name: 'Copper',
		requires: {achievement: Channeling.id},
	},
	{
		id: 'gold',
		name: 'Gold',
		requires: {achievement: Win.id, level: 4},
	},
	{
		id: 'emerald',
		name: 'Emerald',
		requires: undefined,
	},
	{
		id: 'plant',
		name: 'Plant',
		requires: {achievement: SUStainable.id},
	},
	{
		id: 'silver_heart',
		name: 'Silver',
		requires: {achievement: CantTouchThis.id},
	},
	{
		id: 'snow',
		name: 'Snow',
		requires: undefined,
	},
	{
		id: 'soulflame',
		name: 'Soulflame',
		requires: {achievement: DeckedOut.id},
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
