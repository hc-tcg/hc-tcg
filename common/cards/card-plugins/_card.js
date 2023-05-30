// TODO - more validations (types, rarirites, other fields, ...)

/**
 * @typedef {import("common/types/cards").CardDefs} CardDefs
 * @typedef {import("common/types/cards").CardTypeT} CardTypeT
 * @typedef {import("common/types/cards").CardRarityT} CardRarityT
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
		/** @type {PickRequirmentT[] | undefined} */
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
	 * @returns {boolean}
	 * @abstract
	 */
	canAttach(game, pos) {
		// Needs overriding
		throw new Error('Implement canAttach!')
	}

	/**
	 * Called after an instance of this card is attached anywhere on the board
	 * @param {GameModel} game
	 * @param {string} instance The card instance attached
	 */
	onAttach(game, instance) {
		// default is do nothing
	}
}

export default Card
