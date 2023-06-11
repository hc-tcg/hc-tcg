import {discardCard, getHasRedirectingCards} from '../../../../server/utils'
import {GameModel} from '../../../../server/models/game-model'
import EffectCard from './_effect-card'
import {getCardAtPos} from '../../../../server/utils/cards'

/**
 * @typedef {import('common/types/cards').CardPos} CardPos
 */

class LightningRodEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'lightning_rod',
			name: 'Lightning Rod',
			rarity: 'common',
			description:
				"Attach to any of your active or AFK Hermits.\n\n All damage done to you on your opponent's next turn is taken by the Hermit this card is attached to.\n\nDiscard after damage is taken.",
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
		const {currentPlayerId} = game.ds
		const {player} = pos

		console.log(pos)
		if (pos.slot.type !== 'effect') return 'INVALID'
		if (pos.playerId !== currentPlayerId) return 'INVALID'

		if (!pos.row?.hermitCard) return 'NO'
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
		otherPlayer.hooks.beforeAttack[instance] = (attack) => {
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

export default LightningRodEffectCard
