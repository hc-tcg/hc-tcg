import {CARDS} from './card-plugins'
import Card from './card-plugins/_card'

/**
 * @typedef {import("common/cards/card-plugins/hermits/_hermit-card").HermitCard} HermitCard
 * @typedef {import("common/cards/card-plugins/effects/_effect-card").EffectCard} EffectCard
 * @typedef {import("common/cards/card-plugins/single-use/_single-use-card").SingleUseCard} SingleUseCard
 * @typedef {import("common/cards/card-plugins/items/_item-card").ItemCard} ItemCard
 */

/** @type {Record<string, Card>} */
const cardMap = CARDS.reduce((result, card) => {
	result[card.id] = card
	return result
}, {})

/** @type {Record<string, HermitCard>} */
export const HERMIT_CARDS = CARDS.reduce((result, card) => {
	if (card.type === 'hermit') result[card.id] = card
	return result
}, {})

/** @type {Record<string, EffectCard>} */
export const EFFECT_CARDS = CARDS.reduce((result, card) => {
	if (card.type === 'effect') {
		result[card.id] = card
	}
	return result
}, {})

/** @type {Record<string, SingleUseCard>} */
export const SINGLE_USE_CARDS = CARDS.reduce((result, card) => {
	if (card.type === 'single_use') {
		result[card.id] = card
	}
	return result
}, {})

/** @type {Record<string, ItemCard>} */
export const ITEM_CARDS = CARDS.reduce((result, card) => {
	if (card.type === 'item') result[card.id] = card
	return result
}, {})

SINGLE_USE_CARDS['water_bucket'] = EFFECT_CARDS['water_bucket']
SINGLE_USE_CARDS['milk_bucket'] = EFFECT_CARDS['milk_bucket']

export default cardMap
