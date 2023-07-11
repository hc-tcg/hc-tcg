import SingleUseCard from './_single-use-card'
import {GameModel} from '../../../../server/models/game-model'
import {AttackModel} from '../../../../server/models/attack-model'
import {applySingleUse, getActiveRowPos} from '../../../../server/utils'

/**
 * @typedef {import('common/types/cards').CardPos} CardPos
 * @typedef {import('common/types/pick-process').PickedSlots} PickedSlots
 */

class CrossbowSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'crossbow',
			name: 'Crossbow',
			rarity: 'rare',
			description:
				'Do an additional 20hp damage to up to 3 Hermits of your choice.\n\nCan not apply the damage to the same Hermit more than once.',
			pickOn: 'attack',
			pickReqs: [{target: 'opponent', slot: ['hermit'], amount: 3}],
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player} = pos

		player.hooks.getAttacks[instance] = (pickedSlots) => {
			const activePos = getActiveRowPos(player)
			if (!activePos) return []

			const attacks = []
			const slots = pickedSlots[this.id]
			for (const slot of slots) {
				if (!slot.row || !slot.row.state.hermitCard) continue
				const targetPlayer = game.state.players[slot.playerId]
				attacks.push(
					new AttackModel({
						id: this.getInstanceKey(instance),
						attacker: activePos,
						target: {
							player: targetPlayer,
							rowIndex: slot.row.index,
							row: slot.row.state,
						},
						type: 'effect',
					}).addDamage(this.id, 20)
				)
			}
			return attacks
		}

		player.hooks.onAttack[instance] = (attack) => {
			const attackId = this.getInstanceKey(instance)
			if (attack.id !== attackId) return

			applySingleUse(game)

			// Do not apply single use more than once
			delete player.hooks.onAttack[instance]
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
		delete player.hooks.onAttack[instance]
	}
}

export default CrossbowSingleUseCard
