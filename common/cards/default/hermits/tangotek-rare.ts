import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {getNonEmptyRows} from '../../../utils/board'
import HermitCard from '../../base/hermit-card'

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
					'After your attack, both players must choose an AFK Hermit to set as their active Hermit, unless they have no AFK Hermits.\nYour opponent chooses their active Hermit first.',
			},
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos

		player.hooks.afterAttack.add(instance, (attack) => {
			if (
				attack.id !== this.getInstanceKey(instance) ||
				attack.type !== 'secondary' ||
				!attack.getTarget()
			)
				return

			const opponentInactiveRows = getNonEmptyRows(opponentPlayer, true, true)
			const playerInactiveRows = getNonEmptyRows(player, true, true)

			// Check if we are blocked from changing by anything other than the game
			const canChange = !game.isActionBlocked('CHANGE_ACTIVE_HERMIT', ['game'])

			// If opponent has hermit they can switch to, add a pick request for them to switch
			if (opponentInactiveRows.length > 0) {
				// Add a new pick request to the opponent player
				game.addPickRequest({
					playerId: opponentPlayer.id,
					id: this.id,
					message: 'Pick a new active Hermit from your afk hermits',
					onResult(pickResult) {
						// Validation
						if (pickResult.playerId !== opponentPlayer.id) return 'FAILURE_INVALID_PLAYER'
						if (pickResult.rowIndex === undefined) return 'FAILURE_INVALID_SLOT'
						if (pickResult.slot.type !== 'hermit') return 'FAILURE_INVALID_SLOT'
						if (pickResult.card === null) return 'FAILURE_INVALID_SLOT'
						if (pickResult.rowIndex === opponentPlayer.board.activeRow) return 'FAILURE_WRONG_PICK'

						game.changeActiveRow(opponentPlayer, pickResult.rowIndex)

						return 'SUCCESS'
					},
					onTimeout() {
						const opponentInactiveRows = getNonEmptyRows(opponentPlayer, true, true)

						// Choose the first afk row
						for (const inactiveRow of opponentInactiveRows) {
							const {rowIndex} = inactiveRow
							const canBeActive = rowIndex !== opponentPlayer.board.activeRow
							if (canBeActive) {
								game.changeActiveRow(opponentPlayer, rowIndex)
								break
							}
						}
					},
				})
			}

			// If we have an afk hermit, didn't just die, and are not bound in place, add a pick for us to switch
			const attacker = attack.getAttacker()
			if (playerInactiveRows.length !== 0 && attacker && attacker.row.health > 0 && canChange) {
				game.addPickRequest({
					playerId: player.id,
					id: this.id,
					message: 'Pick a new active Hermit from your afk hermits',
					onResult(pickResult) {
						// Validation
						if (pickResult.playerId !== player.id) return 'FAILURE_INVALID_PLAYER'
						if (pickResult.rowIndex === undefined) return 'FAILURE_INVALID_SLOT'
						if (pickResult.slot.type !== 'hermit') return 'FAILURE_INVALID_SLOT'
						if (pickResult.card === null) return 'FAILURE_INVALID_SLOT'
						if (pickResult.rowIndex === player.board.activeRow) return 'FAILURE_WRONG_PICK'

						game.changeActiveRow(player, pickResult.rowIndex)

						return 'SUCCESS'
					},
					onTimeout() {
						const inactiveRows = getNonEmptyRows(player, true, true)

						// Choose the first afk row
						for (const inactiveRow of inactiveRows) {
							const {rowIndex} = inactiveRow
							const canBeActive = rowIndex !== player.board.activeRow
							if (canBeActive) {
								game.changeActiveRow(player, rowIndex)
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
