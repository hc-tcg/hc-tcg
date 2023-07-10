import SINGLE_USE_CARDS from './single-use'
import EFFECT_CARDS from './effects'
import HERMIT_CARDS from './hermits'
import ITEM_CARDS from './items'
import Card from './_card'
import {GameModel} from '../../../server/models/game-model'

/** @type {Array<Card>} */
export const CARDS = [...SINGLE_USE_CARDS, ...EFFECT_CARDS, ...HERMIT_CARDS, ...ITEM_CARDS]

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
