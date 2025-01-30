import BACKGROUNDS from './background'
import BORDERS from './borders'
import COINS from './coins'
import HEARTS from './hearts'
import TITLES from './titles'
import {Cosmetic} from './types'

export const ALL_COSMETICS = [
	...TITLES,
	...COINS,
	...HEARTS,
	...BACKGROUNDS,
	...BORDERS,
]

export const COSMETICS: Record<string | number, Cosmetic> =
	ALL_COSMETICS.reduce((result: Record<string | number, Cosmetic>, card) => {
		result[card.id] = card
		return result
	}, {})
