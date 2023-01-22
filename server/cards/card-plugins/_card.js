class Card {
	constructor(defs) {
		if (
			!defs.id ||
			!defs.name ||
			!defs.rarity ||
			!defs.description ||
			!defs.type
		) {
			throw new Error('Invalid card definition')
		}
		this.id = defs.id
		this.name = defs.name
		this.rarity = defs.rarity
		this.description = defs.description
		this.type = defs.type
	}
}
