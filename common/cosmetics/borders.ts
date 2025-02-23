import HotTake from '../achievements/hot-take'
import Innefective from '../achievements/innefective'
import {Win10, Win500} from '../achievements/wins'
import {Border} from './types'

const BorderDefinitions: Omit<Border, 'type'>[] = [
	{
		id: 'blue',
		name: 'Blue',
	},
	{
		id: 'green_border',
		name: 'Emerald',
		requires: Innefective.id,
	},
	{
		id: 'gold_border',
		name: 'Gold',
		requires: Win500.id,
	},
	{
		id: 'red_border',
		name: 'Red',
		requires: HotTake.id,
	},
	{
		id: 'silver_border',
		name: 'Silver',
		requires: Win10.id,
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
