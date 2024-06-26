import Card, {Attachable, Hermit, Item, SingleUse} from './base/card'
import defaultEffectCards from './default/effects'
import alterEgosEffectCards from './alter-egos/effects'
import adventOfTcgEffectCards from './advent-of-tcg/effects'
import defaultHermitCards from './default/hermits'
import alterEgosHermitCards from './alter-egos/hermits'
import adventOfTcgHermitCards from './advent-of-tcg/hermits'
import defaultItemCards from './default/items'
import defaultSingleUseCards from './default/single-use'
import alterEgosSingleUseCards from './alter-egos/single-use'
import adventOfTcgSingleUseCards from './advent-of-tcg/single-use'
import alterEgosIIHermitCards from './alter-egos-ii/hermits/index'

const effectCardClasses: Array<Card<Attachable>> = [
	...defaultEffectCards,
	...alterEgosEffectCards,
	...adventOfTcgEffectCards,
]

const hermitCardClasses: Array<Card<Hermit>> = [
	...defaultHermitCards,
	...alterEgosHermitCards,
	...adventOfTcgHermitCards,
	...alterEgosIIHermitCards,
]

const itemCardClasses: Array<Card<Item>> = [...defaultItemCards]

const singleUseCardClasses: Array<Card<SingleUse>> = [
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

export const CARDS: Record<string, Card> = allCardClasses.reduce(
	(result: Record<string, Card>, card) => {
		result[card.props.id] = card
		return result
	},
	{}
)

export const EFFECT_CARDS: Record<string, Card<Attachable>> = effectCardClasses.reduce(
	(result: Record<string, Card<Attachable>>, card) => {
		result[card.props.id] = card
		return result
	},
	{}
)

export const HERMIT_CARDS: Record<string, Card<Hermit>> = hermitCardClasses.reduce(
	(result: Record<string, Card<Hermit>>, card) => {
		result[card.props.id] = card
		return result
	},
	{}
)

export const ITEM_CARDS: Record<string, Card<Item>> = itemCardClasses.reduce(
	(result: Record<string, Card<Item>>, card) => {
		result[card.props.id] = card
		return result
	},
	{}
)

export const SINGLE_USE_CARDS: Record<string, Card<SingleUse>> = singleUseCardClasses.reduce(
	(result: Record<string, Card<SingleUse>>, card) => {
		result[card.props.id] = card
		return result
	},
	{}
)
