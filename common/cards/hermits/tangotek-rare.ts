import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {GenericActionResult} from '../../types/game-state'
import {PickResult} from '../../types/server-requests'
import {getNonEmptyRows} from '../../utils/board'
import {isActionAvailable} from '../../utils/game'
import HermitCard from '../base/hermit-card'

class TangoTekRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'tangotek_rare',
			numericId: 95,
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
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos

		player.hooks.afterAttack.add(instance, (attack) => {
			if (
				attack.id !== this.getInstanceKey(instance) ||
				attack.type !== 'secondary' ||
				!attack.target
			)
				return

			const opponentInactiveRows = getNonEmptyRows(opponentPlayer, false)
			const playerInactiveRows = getNonEmptyRows(player, false)

			if (opponentInactiveRows.length !== 0) {
				attack.target.row.ailments.push({
					id: 'knockedout',
					duration: 0, // Last till the start of their next turn
				})
				opponentPlayer.board.activeRow = null

				// Add a new pick request to the opponent player
				opponentPlayer.pickRequests.push({
					message: 'Pick a new active Hermit from your afk hermits',
					onResult(pickResult) {
						// Validation
						if (pickResult.playerId !== opponentPlayer.id) return 'FAILURE_WRONG_PLAYER'
						if (pickResult.rowIndex === undefined) return 'FAILURE_INVALID_SLOT'
						if (pickResult.slot.type !== 'hermit') return 'FAILURE_INVALID_SLOT'
						const row = opponentPlayer.board.rows[pickResult.rowIndex]
						if (row.ailments.find((a) => a.id === 'knockedout')) return 'FAILURE_WRONG_PICK'

						opponentPlayer.board.activeRow = pickResult.rowIndex

						return 'SUCCESS'
					},
					onTimeout() {
						const opponentInactiveRows = getNonEmptyRows(opponentPlayer, false)

						// Choose the first row that doesn't have a knockedout ailment
						for (const inactiveHermit of opponentInactiveRows) {
							if (!inactiveHermit) continue
							const {rowIndex, row} = inactiveHermit
							const canBeActive = row.ailments.every((a) => a.id !== 'knockedout')
							if (canBeActive) {
								opponentPlayer.board.activeRow = rowIndex
							}
						}
					},
				})
			}

			if (
				playerInactiveRows.length !== 0 &&
				attack.attacker &&
				attack.attacker.row.health > 0 &&
				isActionAvailable(game, 'CHANGE_ACTIVE_HERMIT') // Curse of Binding
			) {
				attack.attacker.row.ailments.push({
					id: 'knockedout',
					duration: 1,
				})
				player.board.activeRow = null
			}
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.afterAttack.remove(instance)
	}
}

export default TangoTekRareHermitCard
