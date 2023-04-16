import Card from '../_card'

class CharacterCard extends Card {
	constructor(defs) {
		defs.type = 'character'
		super(defs)

		if (!defs.health || !defs.primary || !defs.secondary || !defs.characterType) {
			throw new Error('Invalid card definition')
		}
		this.health = defs.health
		this.primary = defs.primary
		this.secondary = defs.secondary
		this.characterType = defs.characterType
	}
}

export default CharacterCard
