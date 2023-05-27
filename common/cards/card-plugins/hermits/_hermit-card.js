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
		/** @type {import('common/types/cards').HermitTypeT} */
		this.hermitType = defs.hermitType
	}

	/**
	 * @param {GameModel} game
	 * @param {CardPos} pos
	 */
	canAttach(game, pos) {
		const {currentPlayer} = game.ds

		if (pos.slotType !== 'hermit') return false
		if (pos.playerId !== currentPlayer.id) return false

		return true
	}
}

export default HermitCard
