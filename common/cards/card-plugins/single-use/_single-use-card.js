import Card from '../_card'

class SingleUseCard extends Card {
	constructor(defs) {
		defs.type = 'single_use'
		super(defs)

		if (!defs.description) {
			throw new Error('Invalid card definition')
		}
		this.description = defs.description

		this.attachReq = {target: 'player', type: ['single_use']}
	}

	/**
	 * @param {GameModel} game
	 * @param {CardPos} pos
	 */
	canAttach(game, pos) {
		if (pos.slotType !== 'single_use') return false

		return true
	}
}

export default SingleUseCard
