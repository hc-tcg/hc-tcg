import Card from '../_card'

class HealthCard extends Card {
	constructor(defs) {
		defs.type = 'health'
		super(defs)

		this.health = defs.health
	}
}

export default HealthCard
