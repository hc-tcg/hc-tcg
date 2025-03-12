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
		id: 'amethyst',
		name: 'Amethyst',
		requires: undefined,
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
		id: 'hardcore',
		name: 'Hardcore',
		requires: undefined,
	},
	{
		id: 'honeycomb',
		name: 'Honeycomb',
		requires: undefined,
	},
	{
		id: 'hunger',
		name: 'Haunch',
		offVariantName: 'hunger_empty',
		requires: undefined,
	},
	{
		id: 'ice',
		name: 'Ice',
		requires: undefined,
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
		id: 'potion',
		name: 'Potion',
		requires: undefined,
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
	{
		id: 'slime_hearts',
		name: 'Slime',
		requires: undefined,
	},
	{
		id: 'web',
		name: 'Web',
		requires: undefined,
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
