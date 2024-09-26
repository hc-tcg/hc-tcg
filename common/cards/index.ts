import adventOfTcgEffectCards from './advent-of-tcg/effects'
import adventOfTcgHermitCards from './advent-of-tcg/hermits'
import adventOfTcgItemCards from './advent-of-tcg/items'
import adventOfTcgSingleUseCards from './advent-of-tcg/single-use'
import alterEgosIIHermitCards from './alter-egos-ii/hermits'
import alterEgosIIIHermitCards from './alter-egos-iii/hermits'
import alterEgosIIIItemCards from './alter-egos-iii/items'
import alterEgoEffectCards from './alter-egos/effects'
import alterEgosHermitCards from './alter-egos/hermits'
import alterEgosSingleUseCards from './alter-egos/single-use'
import {Card} from './base/types'
import defaultEffectCards from './default/effects'
import defaultHermitCards from './default/hermits'
import defaultItemCards from './default/items'
import defaultSingleUseCards from './default/single-use'
import seasonXHermitCards from './season-x/hermits'

const effectCardClasses: Array<Card> = [
	...defaultEffectCards,
	...alterEgoEffectCards,
	...adventOfTcgEffectCards,
]

const hermitCardClasses: Array<Card> = [
	...defaultHermitCards,
	...alterEgosHermitCards,
	...adventOfTcgHermitCards,
	...alterEgosIIHermitCards,
	...seasonXHermitCards,
	...alterEgosIIIHermitCards,
]

const itemCardClasses: Array<Card> = [
	...defaultItemCards,
	...alterEgosIIIItemCards,
	...adventOfTcgItemCards,
]

const singleUseCardClasses: Array<Card> = [
	...defaultSingleUseCards,
	...alterEgosSingleUseCards,
	...adventOfTcgSingleUseCards,
]

const allCardClasses: Array<Card> = [
	...effectCardClasses,
	...hermitCardClasses,
	...itemCardClasses,
	...singleUseCardClasses,
]

export const CARDS: Record<string | number, Card> = allCardClasses.reduce(
	(result: Record<string | number, Card>, card) => {
		result[card.numericId] = card
		// To maintain compatability with the deck saving system, we need to be able to look up
		// cards by their id.
		result[card.id] = card
		return result
	},
	{},
)

export const CARDS_LIST = allCardClasses
