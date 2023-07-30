import Card from '../_card'
import CARDS from '../../../cards'
import {GameModel} from '../../../../server/models/game-model'

/**
 * @typedef {import('common/types/cards').EffectDefs} EffectDefs
 * @typedef {import('../../../types/cards').CardPos} CardPos
 * @typedef {import('../../../types/cards').CardTypeT} CardTypeT
 */

class EffectCard extends Card {
	/**
	 * @param {EffectDefs} defs
	 */
	constructor(defs) {
		super({
			type: 'effect',
			id: defs.id,
			name: defs.name,
			rarity: defs.rarity,
			pickOn: defs.pickOn,
			pickReqs: defs.pickReqs,
		})

		if (!defs.description) {
			throw new Error('Invalid card definition!')
		}

		this.description = defs.description
	}

	/**
	 * @param {GameModel} game
	 * @param {CardPos} pos
	 * @returns {"YES" | "NO" | "INVALID"}
	 */
	canAttach(game, pos) {
		const {currentPlayer} = game

		// Wrong slot
		if (pos.slot.type !== 'effect') return 'INVALID'
		if (pos.player.id !== currentPlayer.id) return 'INVALID'

		// Can't attach without hermit card - this is considered like the wrong slot
		if (!pos.row?.hermitCard) return 'INVALID'

		const cardInfo = CARDS[pos.row.hermitCard?.cardId]
		if (!cardInfo) return 'INVALID'
		if (!cardInfo.canAttachToCard(game, pos)) return 'NO'

		return 'YES'
	}

	/**
	 * Returns whether this card is removable from its position
	 * @returns {boolean}
	 */
	getIsRemovable() {
		// default
		return true
	}

	isAttachableToSlotType(slot) {
		if (slot === 'effect') return true
		return false
	}
}

export default EffectCard
