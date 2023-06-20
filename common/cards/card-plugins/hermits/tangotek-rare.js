import HermitCard from './_hermit-card'
import {GameModel} from '../../../../server/models/game-model'
import {getNonEmptyRows, isActionAvailable} from '../../../../server/utils'

/**
 * @typedef {import('common/types/cards').CardPos} CardPos
 */

class TangoTekRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'tangotek_rare',
			name: 'Tango',
			rarity: 'rare',
			hermitType: 'farm',
			health: 290,
			primary: {
				name: 'Skadoodle',
				cost: ['farm'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Extra Flee',
				cost: ['farm', 'farm', 'farm'],
				damage: 100,
				power:
					'At the end of your turn, both players must replace active Hermits with AFK Hermits.\n\nOpponent replaces their Hermit first.\n\nIf there are no AFK Hermits, active Hermit remains in battle.',
			},
			pickOn: 'followup',
			pickReqs: [
				{target: 'opponent', type: ['hermit'], amount: 1, active: false},
			],
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player, otherPlayer} = pos

		player.hooks.afterAttack[instance] = (attackResult) => {
			const {attack} = attackResult

			if (
				attack.id !== this.getInstanceKey(instance) ||
				attack.type !== 'secondary'
			)
				return

			const opponentInactiveRows = getNonEmptyRows(otherPlayer, false)
			const playerInactiveRows = getNonEmptyRows(player, false)

			if (opponentInactiveRows.length !== 0) {
				attack.target.row.ailments.push({
					id: 'knockedout',
					duration: 0,
				})
				otherPlayer.board.activeRow = null
				otherPlayer.followUp = this.id

				// We need to hook here because the follow up is called after onDetach
				// and I can't delete it from there because Tango could die from backlash
				otherPlayer.hooks.onFollowUp[instance] = (followUp, pickedSlots) => {
					if (followUp !== this.id) return
					if (!pickedSlots[this.id] || pickedSlots[this.id].length !== 1) return // Pick again

					const pickedSlot = pickedSlots[this.id]?.[0]
					if (!pickedSlot) return
					const {row} = pickedSlot
					if (!row) return

					const canBeActive = row.state.ailments.every(
						(a) => a.id !== 'knockedout'
					)
					if (!canBeActive) return
					otherPlayer.board.activeRow = row.index
					otherPlayer.followUp = null

					delete otherPlayer.hooks.onFollowUp[instance]
					delete otherPlayer.hooks.onFollowUpTimeout[instance]
				}

				otherPlayer.hooks.onFollowUpTimeout[instance] = (followUp) => {
					if (followUp !== this.id) return
					const opponentInactiveRows = getNonEmptyRows(otherPlayer, false)
					otherPlayer.followUp = null

					// Choose the first row that doesn't have a knockedout ailment
					for (const {index, row} of opponentInactiveRows) {
						const canBeActive = row.ailments.every((a) => a.id !== 'knockedout')
						if (canBeActive) {
							otherPlayer.board.activeRow = index
						}
					}

					delete otherPlayer.hooks.onFollowUp[instance]
					delete otherPlayer.hooks.onFollowUpTimeout[instance]
				}
			}

			if (
				playerInactiveRows.length !== 0 &&
				attack.attacker &&
				attack.attacker.row.health > 0 &&
				isActionAvailable(game, 'CHANGE_ACTIVE_HERMIT') // Curse of Binding
			) {
				attack.attacker.row.ailments.push({
					id: 'knockedout',
					duration: 0,
				})
				player.board.activeRow = null
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

		delete player.hooks.afterAttack[instance]
	}
}

export default TangoTekRareHermitCard
