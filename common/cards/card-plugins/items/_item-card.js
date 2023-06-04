import {GameModel} from '../../../../server/models/game-model'
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
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	canAttach(game, pos) {
		const {currentPlayer} = game.ds

		if (pos.slot.type !== 'item') return 'NO'
		if (pos.playerId !== currentPlayer.id) return 'NO'

		// Can't attach without hermit
		if (!pos.rowState?.hermitCard) return 'INVALID'

		return 'YES'
	}
}

export default ItemCard
