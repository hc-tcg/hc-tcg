import Card from '../_card'

class HermitCard extends Card {
	constructor(defs) {
		defs.type = 'hermit'
		super(defs)

		if (!defs.health || !defs.primary || !defs.secondary || !defs.hermitType) {
			throw new Error('Invalid card definition')
		}
		this.health = defs.health
		this.primary = defs.primary
		this.secondary = defs.secondary
		this.hermitType = defs.hermitType

		this.attachReq = {target: 'player', type: ['hermit']}
	}

	getBackground() {
		return this.id.split('_')[0]
	}
}

export default HermitCard
