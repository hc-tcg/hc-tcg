import {CARDS} from './card-plugins'

/**
 * @typedef {import('common/types/cards').CardInfoT} CardInfoT
 * @typedef {import('common/types/cards').HermitCardT} HermitCardT
 * @typedef {import('common/types/cards').EffectCardT} EffectCardT
 * @typedef {import('common/types/cards').ItemCardT} ItemCardT
 */

/** @type {Record<string, CardInfoT>} */
const cardMap = CARDS.reduce((result, card) => {
	result[card.id] = card
	return result
}, {})

/** @type {Record<string, HermitCardT>} */
export const HERMIT_CARDS = CARDS.reduce((result, card) => {
	if (card.type === 'hermit') result[card.id] = card
	return result
}, {})

/** @type {Record<string, EffectCardT>} */
export const EFFECT_CARDS = CARDS.reduce((result, card) => {
	if (card.type === 'effect') {
		result[card.id] = card
	}
	return result
}, {})

/** @type {Record<string, EffectCardT>} */
export const SINGLE_USE_CARDS = CARDS.reduce((result, card) => {
	if (card.type === 'single_use') {
		result[card.id] = card
	}
	return result
}, {})

/** @type {Record<string, ItemCardT>} */
export const ITEM_CARDS = CARDS.reduce((result, card) => {
	if (card.type === 'item') result[card.id] = card
	return result
}, {})

SINGLE_USE_CARDS['water_bucket'] = EFFECT_CARDS['water_bucket']
SINGLE_USE_CARDS['milk_bucket'] = EFFECT_CARDS['milk_bucket']

export default cardMap
