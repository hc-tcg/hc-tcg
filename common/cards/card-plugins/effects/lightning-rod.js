import {discardCard} from '../../../../server/utils'
import {GameModel} from '../../../../server/models/game-model'
import EffectCard from './_effect-card'
import {getCardAtPos} from '../../../../server/utils/cards'
import {isTargetingPos} from '../../../../server/utils/attacks'

/**
 * @typedef {import('common/types/cards').CardPos} CardPos
 */

class LightningRodEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'lightning_rod',
			name: 'Lightning Rod',
			rarity: 'rare',
			description:
				"Attach to any of your active or AFK Hermits.\n\n All damage done to you on your opponent's next turn is taken by the Hermit this card is attached to.\n\nDiscard after damage is taken.\n\nOnly one of these cards can be attached at a time.",
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {CardPos} pos
	 */
	canAttach(game, pos) {
		if (super.canAttach(game, pos) === 'INVALID') return 'INVALID'
		console.log('hey there')

		const board = pos.player.board
		if (board.rows.find((row) => row.effectCard?.cardId === this.id)) {
			// Can't attach if there's already one attached
			return 'NO'
		}

		return 'YES'
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player, opponentPlayer, row, rowIndex} = pos

		// Only on opponents turn
		opponentPlayer.hooks.beforeAttack[instance] = (attack) => {
			if (attack.isType('ailment') || attack.isBacklash) return
			if (!row || rowIndex === null || !row.hermitCard) return

			// Attack already has to be targeting us
			if (attack.target?.player.id !== player.id) return

			attack.target = {
				player: player,
				rowIndex: rowIndex,
				row: row,
			}
		}

		opponentPlayer.hooks.afterAttack[instance] = (attack) => {
			if (!isTargetingPos(attack, pos)) return
			if (attack.calculateDamage() <= 0) return

			discardCard(game, getCardAtPos(game, pos))
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {opponentPlayer} = pos
		delete opponentPlayer.hooks.beforeAttack[instance]
		delete opponentPlayer.hooks.afterAttack[instance]
	}

	getExpansion() {
		return 'alter_egos'
	}
}

export default LightningRodEffectCard
