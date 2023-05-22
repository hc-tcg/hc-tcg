// TODO - more validations (types, rarirites, other fields, ...)

/**
 * @typedef {import("common/types/cards").CardDefs} CardDefs
 * @typedef {import("common/types/cards").CardTypeT} CardTypeT
 * @typedef {import("common/types/cards").CardRarityT} CardRarityT
 */

class Card {
	/**
	 * @param {CardDefs} defs
	 */
	constructor({type, id, name, rarity}) {
		if (!type || !id || !name || !rarity) {
			throw new Error('Invalid card definition!')
		}
		/** @type {CardTypeT} */
		this.type = type
		/** @type {string} */
		this.id = id
		/** @type {string} */
		this.name = name
		/** @type {CardRarityT} */
		this.rarity = rarity
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
}

export default Card
