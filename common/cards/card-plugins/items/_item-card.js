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

		if (pos.slot.type !== 'item') return 'INVALID'
		if (pos.playerId !== currentPlayer.id) return 'INVALID'

		// Can't attach without hermit
		if (!pos.row?.hermitCard) return 'NO'

		return 'YES'
	}
}

export default ItemCard
