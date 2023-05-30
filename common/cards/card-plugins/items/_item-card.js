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

	/**
	 * @param {GameModel} game
	 * @param {CardPos} pos
	 */
	canAttach(game, pos) {
		const {currentPlayer} = game.ds

		if (pos.slotType !== 'item') return false
		if (pos.playerId !== currentPlayer.id) return false

		if (!pos.rowState?.hermitCard) return false

		return true
	}
}

export default ItemCard
