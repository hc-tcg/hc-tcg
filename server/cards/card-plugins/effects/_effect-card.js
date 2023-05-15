import Card from '../_card'

class EffectCard extends Card {
	constructor(defs) {
		defs.type = 'effect'
		super(defs)

		if (!defs.description) {
			throw new Error('Invalid card definition')
		}
		this.description = defs.description

		this.attachReq = {target: 'player', type: ['effect']}
	}
}

export default EffectCard
