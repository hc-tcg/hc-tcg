import Card from '../_card'

class EffectCard extends Card {
	constructor(defs) {
		defs.type = 'effect'
		super(defs)
	}
}

export default EffectCard
