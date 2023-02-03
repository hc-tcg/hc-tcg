import Card from '../_card'

class ItemCard extends Card {
	constructor(defs) {
		defs.type = 'item'
		super(defs)

		if (!defs.hermitType) {
			throw new Error('Invalid card definition')
		}
		this.hermitType = defs.hermitType
	}
}

export default ItemCard
