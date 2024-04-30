import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {getNonEmptyRows} from '../../../utils/board'
import HermitCard from '../../base/hermit-card'

class IJevinRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'ijevin_rare',
			numericId: 39,
			name: 'Jevin',
			rarity: 'rare',
			hermitType: 'speedrunner',
			health: 300,
			primary: {
				name: 'Your Boi',
				cost: ['any'],
				damage: 30,
				power: null,
			},
			secondary: {
				name: 'Peace Out',
				cost: ['speedrunner', 'speedrunner', 'any'],
				damage: 90,
				power:
					'After your attack, your opponent must choose an AFK Hermit to set as their active Hermit, unless they have no AFK Hermits.',
			},
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos

		player.hooks.afterAttack.add(instance, (attack) => {
			if (attack.id !== this.getInstanceKey(instance)) return
			if (attack.type !== 'secondary' || !attack.getTarget()) return

			const opponentInactiveRows = getNonEmptyRows(opponentPlayer, true, true)
			if (opponentInactiveRows.length !== 0) {
				const lastActiveRow = opponentPlayer.board.activeRow

				game.addPickRequest({
					playerId: opponentPlayer.id, // For opponent player to pick
					id: this.id,
					message: 'Choose a new active Hermit from your afk Hermits.',
					onResult(pickResult) {
						if (pickResult.playerId !== opponentPlayer.id) return 'FAILURE_INVALID_PLAYER'

						const rowIndex = pickResult.rowIndex
						if (rowIndex === undefined) return 'FAILURE_INVALID_SLOT'
						if (rowIndex === lastActiveRow) return 'FAILURE_INVALID_SLOT'

						if (pickResult.slot.type !== 'hermit') return 'FAILURE_INVALID_SLOT'
						if (!pickResult.card) return 'FAILURE_INVALID_SLOT'

						const row = opponentPlayer.board.rows[rowIndex]
						if (!row.hermitCard) return 'FAILURE_INVALID_SLOT'

						game.changeActiveRow(opponentPlayer, rowIndex)

						return 'SUCCESS'
					},
					onTimeout() {
						const opponentInactiveRows = getNonEmptyRows(opponentPlayer, true, true)

						// Choose the first afk row
						for (const inactiveRow of opponentInactiveRows) {
							const {rowIndex} = inactiveRow
							const canBeActive = rowIndex !== lastActiveRow
							if (canBeActive) {
								game.changeActiveRow(opponentPlayer, rowIndex)
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

export default IJevinRareHermitCard
