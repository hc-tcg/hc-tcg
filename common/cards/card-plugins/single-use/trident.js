import SingleUseCard from './_single-use-card'
import {flipCoin, applySingleUse, discardSingleUse, getActiveRowPos} from '../../../../server/utils'
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
		const {player, opponentPlayer} = pos

		player.hooks.getAttacks[instance] = () => {
			const activePos = getActiveRowPos(player)
			if (!activePos) return []
			const opponentActivePos = getActiveRowPos(opponentPlayer)
			if (!opponentActivePos) return []

			const tridentAttack = new AttackModel({
				id: this.getInstanceKey(instance),
				attacker: activePos,
				target: opponentActivePos,
				type: 'effect',
			}).addDamage(this.id, 30)

			return [tridentAttack]
		}

		player.hooks.onAttack[instance] = (attack) => {
			const attackId = this.getInstanceKey(instance)
			if (attack.id !== attackId) return

			player.custom[this.getInstanceKey(instance)] = flipCoin(player, this.id)[0]

			applySingleUse(game)
		}

		player.hooks.onApply[instance] = (pickedSlots, modalResult) => {
			// Return to hand
			if (player.custom[this.getInstanceKey(instance)] === 'heads') {
				// Reset single use card used, won't return to the hand otherwise
				player.board.singleUseCardUsed = false
				discardSingleUse(game, player)
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
		delete player.hooks.onApply[instance]
		delete player.hooks.onAttack[instance]
		delete player.custom[this.getInstanceKey(instance)]
	}

	getExpansion() {
		return 'alter_egos'
	}
}

export default TridentSingleUseCard
