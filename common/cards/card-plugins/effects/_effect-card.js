import {AttackModel} from '../../../../server/models/attack-model'
import {GameModel} from '../../../../server/models/game-model'
import Card from '../_card'

/**
 * @typedef {import('common/types/cards').EffectDefs} EffectDefs
 * @typedef {import('../../../types/cards').CardPos} CardPos
 * @typedef {import('../../../types/cards').CardTypeT} CardTypeT
 * @typedef {import('../../../types/attack').AttackResult} AttackResult
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

		/** @type {string} */
		this.description = defs.description
	}

	/**
	 * @param {GameModel} game
	 * @param {CardPos} pos
	 */
	canAttach(game, pos) {
		const {currentPlayer} = game.ds

		// Wrong slot
		if (pos.slot.type !== 'effect') return 'INVALID'
		if (pos.playerId !== currentPlayer.id) return 'INVALID'

		// Can't attach without hermit card
		if (!pos.row?.hermitCard) return 'NO'

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

	/**
	 * Returns wheter this card redirects attacks to itself
	 * @returns {boolean}
	 */
	getIsRedirecting() {
		// default
		return false
	}
}

export default EffectCard
