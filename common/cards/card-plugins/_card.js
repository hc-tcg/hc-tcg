// TODO - more validations (types, rarirites, other fields, ...)

import {GameModel} from '../../../server/models/game-model'

/**
 * @typedef {import("../../types/cards").CardDefs} CardDefs
 * @typedef {import("../../types/cards").CardPos} CardPos
 * @typedef {import("../../types/cards").CardTypeT} CardTypeT
 * @typedef {import("../../types/cards").CardRarityT} CardRarityT
 * @typedef {import("../../../server/utils/reqs").PickRequirmentT} PickRequirmentT
 */

class Card {
	/**
	 * @param {CardDefs} defs
	 */
	constructor(defs) {
		if (!defs.type || !defs.id || !defs.name || !defs.rarity) {
			throw new Error('Invalid card definition!')
		}
		/** @type {CardTypeT} */
		this.type = defs.type
		/** @type {string} */
		this.id = defs.id
		/** @type {string} */
		this.name = defs.name
		/** @type {CardRarityT} */
		this.rarity = defs.rarity
		/** @type {string | undefined} */
		this.pickOn = defs.pickOn
		/** @type {Array<PickRequirmentT> | undefined} */
		this.pickReqs = defs.pickReqs
	}

	// Keys for storing info
	/**
	 * @param {string} keyName
	 */
	getKey(keyName) {
		return this.id + ':' + keyName
	}
	/**
	 * @param {string} instance
	 * @param {string} keyName
	 */
	getInstanceKey(instance, keyName = '') {
		return this.id + ':' + instance + ':' + keyName
	}

	/**
	 * If the specified slot is empty, can this card be attached there
	 * @param {GameModel} game
	 * @param {CardPos} pos
	 * @returns {"YES" | "NO" | "INVALID"} NO if we can't, INVALID if we don't meet requirements, YES if we can
	 * @abstract
	 */
	canAttach(game, pos) {
		// Needs overriding
		throw new Error('Implement canAttach!')
	}

	/**
	 * Called when an instance of this card is attached to the board
	 * @param {GameModel} game
	 * @param {string} instance The card instance attached
	 */
	onAttach(game, instance) {
		// default is do nothing
	}

	/**
	 * Returns the expansion this card is a part of
	 * @returns {string}
	 */
	getExpansion() {
		return 'default'
  }
    
   /*
	 * Called when an instance of this card is removed from the board
	 * @param {GameModel} game
	 * @param {string} instance
	 */
	onDetach(game, instance) {
		// default is do nothing
	}

	/**
	 * Returns the palette to use for this card
	 * @returns {string}
	 */
	getPalette() {
		return 'default'
	}
}

export default Card
