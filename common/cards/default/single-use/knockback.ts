import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {applySingleUse, getActiveRow, getNonEmptyRows} from '../../../utils/board'
import SingleUseCard from '../../base/single-use-card'

class KnockbackSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'knockback',
			numericId: 73,
			name: 'Knockback',
			rarity: 'rare',
			description:
				'After your attack, your opponent must choose an AFK Hermit to set as their active Hermit, unless they have no AFK Hermits.',
			log: (values) => `${values.defaultLog} with {your|their} attack`,
		})
	}

	override canAttach(game: GameModel, pos: CardPosModel) {
		const result = super.canAttach(game, pos)
		const {opponentPlayer} = pos

		// Check if there is an AFK Hermit
		const inactiveRows = getNonEmptyRows(opponentPlayer, true)
		if (inactiveRows.length === 0) result.push('UNMET_CONDITION')

		return result
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos

		player.hooks.afterAttack.add(instance, (attack) => {
			applySingleUse(game)

			// Only Apply this for the first attack
			player.hooks.afterAttack.remove(instance)
		})

		player.hooks.onApply.add(instance, () => {
			const activeRow = getActiveRow(opponentPlayer)

			if (activeRow && activeRow.health) {
				const lastActiveRow = opponentPlayer.board.activeRow

				game.addPickRequest({
					playerId: opponentPlayer.id,
					id: this.id,
					message: 'Choose a new active Hermit from your afk Hermits',
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
						const opponentInactiveRows = getNonEmptyRows(opponentPlayer, true)

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
		player.hooks.onApply.remove(instance)
	}
}

export default KnockbackSingleUseCard
