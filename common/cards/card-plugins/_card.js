// TODO - more validations (types, rarirites, other fields, ...)

import {GameModel} from '../../../server/models/game-model'

/**
 * @typedef {import("../../types/cards").CardDefs} CardDefs
 * @typedef {import("../../types/cards").CardPos} CardPos
 * @typedef {import("../../types/cards").CardTypeT} CardTypeT
 * @typedef {import("../../types/cards").CardRarityT} CardRarityT
 * @typedef {import("../../types/cards").SlotTypeT} SlotTypeT
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
		/** @type {Array<import('../../types/pick-process').PickRequirmentT> | undefined} */
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
	 *
	 * Returns INVALID if it's an invalid slot, NO if we don't meet requirements, YES if we can
	 * @param {GameModel} game
	 * @param {CardPos} pos
	 * @returns {"YES" | "NO" | "INVALID"}
	 * @abstract
	 */
	canAttach(game, pos) {
		// Needs overriding
		throw new Error('Implement canAttach!')
	}

	/**
	 * If this card is attached to a Hermit slot, can another card be attached to the row this card is in
	 * @param {GameModel} game
	 * @param {CardPos} pos
	 * @returns {boolean}
	 */
	canAttachToCard(game, pos) {
		// default is true
		return true
	}

	/**
	 * Called when an instance of this card is attached to the board
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onAttach(game, instance, pos) {
		// default is do nothing
	}

	/**
	 * Called when an instance of this card is removed from the board
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onDetach(game, instance, pos) {
		// default is do nothing
	}

	/**
	 * Returns the expansion this card is a part of
	 * @returns {string}
	 */
	getExpansion() {
		return 'default'
	}

	/**
	 * Returns the palette to use for this card
	 * @returns {string}
	 */
	getPalette() {
		return 'default'
	}

	/**
	 * Returns whether this card is attachable to a specified slot type
	 * @param {SlotTypeT} slot
	 * @returns {boolean}
	 */
	isAttachableToSlotType(slot) {
		return false
	}
}

export default Card
