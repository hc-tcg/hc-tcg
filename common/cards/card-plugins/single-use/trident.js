import SingleUseCard from './_single-use-card'
import {
	flipCoin,
	applySingleUse,
	discardSingleUse,
} from '../../../../server/utils'
import {GameModel} from '../../../../server/models/game-model'
import {AttackModel} from '../../../../server/models/attack-model'

/**
 * @typedef {import('common/types/cards').CardPos} CardPos
 */

class TridentSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'trident',
			name: 'Trident',
			rarity: 'rare',
			description:
				'Add 30hp damage at the end of your attack.\n\nFlip a coin.\n\nIf heads, this card is returned to your hand.',
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player, otherPlayer} = pos

		player.hooks.getAttacks[instance] = () => {
			const index = player.board.activeRow
			if (index === null) return []
			const row = player.board.rows[index]
			if (!row || !row.hermitCard) return []

			const opponentIndex = otherPlayer.board.activeRow
			if (!opponentIndex) return []
			const opponentRow = otherPlayer.board.rows[opponentIndex]
			if (!opponentRow || !opponentRow.hermitCard) return []

			const tridentAttack = new AttackModel({
				id: this.getInstanceKey(instance),
				attacker: {index, row},
				target: {index: opponentIndex, row: opponentRow},
				type: 'effect',
			}).addDamage(30)

			return [tridentAttack]
		}

		player.hooks.afterAttack[instance] = (attackResult) => {
			const attackId = this.getInstanceKey(instance)
			if (!attackResult || attackResult.attack.id !== attackId) return

			const coinFlip = flipCoin(player, this.id)
			player.coinFlips[this.id] = coinFlip

			// Return to hand
			if (coinFlip[0] === 'heads' && player.board.singleUseCard) {
				player.board.singleUseCardUsed = false
				discardSingleUse(game, player)
			} else {
				applySingleUse(game)
			}
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player} = pos

		delete player.hooks.getAttacks[instance]
		delete player.hooks.afterAttack[instance]
	}

	getExpansion() {
		return 'alter_egos'
	}
}

export default TridentSingleUseCard
