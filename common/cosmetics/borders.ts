import HotTake from '../achievements/hot-take'
import Innefective from '../achievements/inneffective'
import LoyaltyIII from '../achievements/loyalty-iii'
import SignalInversion from '../achievements/signal-inversion'
import Win from '../achievements/wins'
import {Border} from './types'

const BorderDefinitions: Omit<Border, 'type'>[] = [
	{
		id: 'blue',
		name: 'Blue',
	},
	{
		id: 'cherry',
		name: 'Cherry',
	},
	{
		id: 'copper_border',
		name: 'Copper',
		requires: {achievement: LoyaltyIII.id},
	},
	{
		id: 'green_border',
		name: 'Emerald',
		requires: {achievement: Innefective.id},
	},
	{
		id: 'gold_border',
		name: 'Gold',
		requires: {achievement: Win.id, level: 3},
	},
	{
		id: 'red_border',
		name: 'Red',
		requires: {achievement: HotTake.id},
	},
	{
		id: 'red_and_black',
		name: 'Redstone',
		requires: {achievement: SignalInversion.id},
	},
	{
		id: 'silver_border',
		name: 'Silver',
		requires: {achievement: Win.id, level: 1},
	},
	{
		id: 'quartz_pillar',
		name: 'Quartz',
	},
	{
		id: 'fireworks',
		name: 'Fireworks',
	},
]

export const ALL_BORDERS: Border[] = BorderDefinitions.map((border) => ({
	type: 'border',
	...border,
}))

export const BORDERS: Record<string | number, Border> = ALL_BORDERS.reduce(
	(result: Record<string | number, Border>, card) => {
		result[card.id] = card
		return result
	},
	{},
)
