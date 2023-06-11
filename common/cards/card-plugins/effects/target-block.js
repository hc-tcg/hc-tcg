import {discardCard, getHasRedirectingCards} from '../../../../server/utils'
import {GameModel} from '../../../../server/models/game-model'
import EffectCard from './_effect-card'
import {getCardAtPos} from '../../../../server/utils/cards'

/**
 * @typedef {import('common/types/cards').CardPos} CardPos
 */

class TargetBlockEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'target_block',
			name: 'Target Block',
			rarity: 'rare',
			description:
				"Choose one of your opponent's AFK Hermits to take all damage done during this turn.",
		})
	}

	getIsRedirecting() {
		return true
	}

	/**
	 * @param {GameModel} game
	 * @param {CardPos} pos
	 */
	canAttach(game, pos) {
		const {opponentPlayerId} = game.ds
		const {player, rowIndex} = pos

		console.log(pos)
		if (pos.slot.type !== 'effect') return 'INVALID'
		if (pos.playerId !== opponentPlayerId) return 'INVALID'

		if (!pos.row?.hermitCard || player.board.activeRow === rowIndex) return 'NO'
		// Restrict to one per side
		if (getHasRedirectingCards(player)) return 'NO'

		return 'YES'
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {otherPlayer, row, rowIndex} = pos
		otherPlayer.hooks.beforeAttack[instance] = (attack, pickedSlots) => {
			if (!row || rowIndex === null || !row.hermitCard) return
			attack.target.index = rowIndex
			attack.target.row = row
		}

		otherPlayer.hooks.afterAttack[instance] = (attackResult) => {
			discardCard(game, getCardAtPos(game, pos))
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {otherPlayer} = pos
		delete otherPlayer.hooks.beforeAttack[instance]
		delete otherPlayer.hooks.afterAttack[instance]
	}
}

export default TargetBlockEffectCard
