import Card from './base/card'
import EffectCard from './base/effect-card'
import HermitCard from './base/hermit-card'
import ItemCard from './base/item-card'
import SingleUseCard from './base/single-use-card'
import {EFFECT_CARD_CLASSES} from './effects'
import HERMIT_CARD_CLASSES from './hermits'
import {ITEM_CARD_CLASSES} from './items'
import {SINGLE_USE_CARD_CLASSES} from './single-use'

const cardClasses: Array<Card> = [
	...EFFECT_CARD_CLASSES,
	...HERMIT_CARD_CLASSES,
	...ITEM_CARD_CLASSES,
	...SINGLE_USE_CARD_CLASSES,
]

export const CARDS: Record<string, Card> = cardClasses.reduce(
	(result: Record<string, Card>, card) => {
		result[card.id] = card
		return result
	},
	{}
)

export const EFFECT_CARDS: Record<string, EffectCard> = EFFECT_CARD_CLASSES.reduce(
	(result: Record<string, EffectCard>, card) => {
		result[card.id] = card
		return result
	},
	{}
)

export const HERMIT_CARDS: Record<string, HermitCard> = HERMIT_CARD_CLASSES.reduce(
	(result: Record<string, HermitCard>, card) => {
		result[card.id] = card
		return result
	},
	{}
)

export const ITEM_CARDS: Record<string, ItemCard> = ITEM_CARD_CLASSES.reduce(
	(result: Record<string, ItemCard>, card) => {
		result[card.id] = card
		return result
	},
	{}
)

export const SINGLE_USE_CARDS: Record<string, SingleUseCard> = SINGLE_USE_CARD_CLASSES.reduce(
	(result: Record<string, SingleUseCard>, card) => {
		result[card.id] = card
		return result
	},
	{}
)
