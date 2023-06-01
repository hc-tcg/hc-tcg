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

		if (pos.slotType !== 'effect') return false
		if (pos.playerId !== currentPlayer.id) return false

		if (!pos.rowState?.hermitCard) return false

		return true
	}

	/**
	 * Returns whether this card is removable from its position
	 * @param {GameModel} game
	 * @param {string} instance
	 * @returns {boolean}
	 */
	getIsRemovable(game, instance) {
		// default
		return true
	}
}

export default EffectCard
