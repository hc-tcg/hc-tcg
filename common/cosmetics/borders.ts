import CostumeParty from '../achievements/costume-party'
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
		id: 'lapis_border',
		name: 'Lapis',
		requires: undefined,
	},
	{
		id: 'magenta_border',
		name: 'Magenta',
		requires: {achievement: CostumeParty.id},
	},
	{
		id: 'dark_border',
		name: 'Netherite',
		requires: undefined,
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
