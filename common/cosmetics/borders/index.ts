import {Border} from '../types'
import BlueBorder from './blue'

export const ALL_BORDERS: Border[] = [BlueBorder]

export const BORDERS: Record<string | number, Border> = ALL_BORDERS.reduce(
	(result: Record<string | number, Border>, card) => {
		result[card.id] = card
		return result
	},
	{},
)
