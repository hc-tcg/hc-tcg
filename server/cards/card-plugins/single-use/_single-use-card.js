import Card from '../_card'

class SingleUseCard extends Card {
	constructor(defs) {
		defs.type = 'single_use'
		super(defs)

		if (!defs.description) {
			throw new Error('Invalid card definition')
		}
		this.description = defs.description
	}
}

export default SingleUseCard
