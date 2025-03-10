import CantTouchThis from '../achievements/cant-touch-this'
import Channeling from '../achievements/channeling'
import DeckedOut from '../achievements/decked-out'
import iBuy from '../achievements/ibuy'
import SUStainable from '../achievements/sustainable'
import TerribleTrades from '../achievements/terrible-trades'
import UseLikeAHermit from '../achievements/use-like-a-hermit'
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
		id: 'emerald',
		name: 'Emerald',
		requires: {achievement: TerribleTrades.id},
	},
	{
		id: 'plant',
		name: 'Flower',
		requires: {achievement: SUStainable.id},
	},
	{
		id: 'gold',
		name: 'Gold',
		requires: {achievement: Win.id, level: 4},
	},
	{
		id: 'wooden',
		name: 'Heart Stand',
		requires: {achievement: UseLikeAHermit.id},
	},
	{
		id: 'lamp',
		name: 'Lamp',
		offVariantName: 'lamp_off',
		requires: {achievement: iBuy.id},
	},
	{
		id: 'silver_heart',
		name: 'Silver',
		requires: {achievement: CantTouchThis.id},
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
