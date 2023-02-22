import SINGLE_USE_CARDS from './single-use'
import EFFECT_CARDS from './effects'
import HERMIT_CARDS from './hermits'
import ITEM_CARDS from './items'

/**
 * @typedef {import("models/game-model").Game} Game
 */

export const CARDS = [
	...SINGLE_USE_CARDS,
	...EFFECT_CARDS,
	...HERMIT_CARDS,
	...ITEM_CARDS,
]

/**
 * @param {Game} game
 */
function registerCards(game) {
	for (let card of CARDS) {
		card.register(game)
	}
}

export default registerCards
