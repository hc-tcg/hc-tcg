// TODO - more validations (types, rarirites, other fields, ...)
class Card {
	constructor(defs) {
		if (!defs.id || !defs.name || !defs.rarity || !defs.type) {
			throw new Error('Invalid card definition')
		}
		this.id = defs.id
		this.name = defs.name
		this.rarity = defs.rarity
		this.type = defs.type
	}

	/**
	 * @param {string} name
	 */
	getKey(name) {
		return this.id + ':' + name
	}

	getPalette() {
		return 'default'
	}
}

export default Card
