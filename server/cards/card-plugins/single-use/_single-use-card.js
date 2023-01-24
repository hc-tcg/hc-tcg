import Card from '../_card'

class SingleUseCard extends Card {
	constructor(defs) {
		defs.type = 'single_use'
		super(defs)
	}
}

export default SingleUseCard
