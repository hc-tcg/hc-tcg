import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
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

			const opponentInactiveRows = getNonEmptyRows(opponentPlayer, true, true)
			const playerInactiveRows = getNonEmptyRows(player, true, true)

			// Curse of Binding
			const canChange = isActionAvailable(game, 'CHANGE_ACTIVE_HERMIT')

			// If opponent has hermit they can switch to, add a pick request for them to switch
			if (opponentInactiveRows.length > 0) {
				// Add a new pick request to the opponent player
				game.addPickRequest({
					playerId: opponentPlayer.id,
					id: this.id,
					message: 'Pick a new active Hermit from your afk hermits',
					onResult(pickResult) {
						// Validation
						if (pickResult.playerId !== opponentPlayer.id) return 'FAILURE_WRONG_PLAYER'
						if (pickResult.rowIndex === undefined) return 'FAILURE_INVALID_SLOT'
						if (pickResult.slot.type !== 'hermit') return 'FAILURE_INVALID_SLOT'
						if (pickResult.card === null) return 'FAILURE_INVALID_SLOT'
						if (pickResult.rowIndex === opponentPlayer.board.activeRow) return 'FAILURE_WRONG_PICK'

						opponentPlayer.board.activeRow = pickResult.rowIndex

						return 'SUCCESS'
					},
					onTimeout() {
						const opponentInactiveRows = getNonEmptyRows(opponentPlayer, true, true)

						// Choose the first afk row
						for (const inactiveRow of opponentInactiveRows) {
							const {rowIndex} = inactiveRow
							const canBeActive = rowIndex !== opponentPlayer.board.activeRow
							if (canBeActive) {
								opponentPlayer.board.activeRow = rowIndex
								break
							}
						}
					},
				})
			}

			// If we have an afk hermit, didn't just die, and are not bound in place, add a pick for us to switch
			if (
				playerInactiveRows.length !== 0 &&
				attack.attacker &&
				attack.attacker.row.health > 0 &&
				canChange
			) {
				game.addPickRequest({
					playerId: player.id,
					id: this.id,
					message: 'Pick a new active Hermit from your afk hermits',
					onResult(pickResult) {
						// Validation
						if (pickResult.playerId !== player.id) return 'FAILURE_WRONG_PLAYER'
						if (pickResult.rowIndex === undefined) return 'FAILURE_INVALID_SLOT'
						if (pickResult.slot.type !== 'hermit') return 'FAILURE_INVALID_SLOT'
						if (pickResult.card === null) return 'FAILURE_INVALID_SLOT'
						if (pickResult.rowIndex === player.board.activeRow) return 'FAILURE_WRONG_PICK'

						player.board.activeRow = pickResult.rowIndex

						return 'SUCCESS'
					},
					onTimeout() {
						const inactiveRows = getNonEmptyRows(player, true, true)

						// Choose the first afk row
						for (const inactiveRow of inactiveRows) {
							const {rowIndex} = inactiveRow
							const canBeActive = rowIndex !== player.board.activeRow
							if (canBeActive) {
								player.board.activeRow = rowIndex
								break
							}
						}
					},
				})
			}
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.afterAttack.remove(instance)
	}
}

export default TangoTekRareHermitCard
