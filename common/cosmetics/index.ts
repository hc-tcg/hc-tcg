import {ALL_BACKGROUNDS} from './background'
import {ALL_BORDERS} from './borders'
import {ALL_COINS} from './coins'
import {ALL_HEARTS} from './hearts'
import {ALL_TITLES} from './titles'
import {Cosmetic} from './types'

export const ALL_COSMETICS = [
	...ALL_TITLES,
	...ALL_COINS,
	...ALL_HEARTS,
	...ALL_BACKGROUNDS,
	...ALL_BORDERS,
]

export const COSMETICS: Record<string | number, Cosmetic> =
	ALL_COSMETICS.reduce((result: Record<string | number, Cosmetic>, card) => {
		result[card.id] = card
		return result
	}, {})
