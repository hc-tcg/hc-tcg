import SINGLE_USE_CARDS from './single-use'
import EFFECT_CARDS from './effects'
import HERMIT_CARDS from './hermits'
import ITEM_CARDS from './../common/cards/items'
import Card from './_card'

/**
 * @typedef {import("models/game-model").GameModel} GameModel
 */

/** @type {Array<Card>} */
export const CARDS = [
	...SINGLE_USE_CARDS,
	...EFFECT_CARDS,
	...HERMIT_CARDS,
	...ITEM_CARDS,
]

/**
 * @param {GameModel} game
 */
function registerCards(game) {
	//@TODO replace card registration with using own methods
	//for (let card of CARDS) {
	//	if (card.register) {
	//		card.register(game)
	//	}
	//}
}

export default registerCards
