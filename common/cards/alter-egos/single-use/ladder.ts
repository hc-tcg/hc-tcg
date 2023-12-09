import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {SlotPos} from '../../../types/cards'
import {applySingleUse} from '../../../utils/board'
import {isCardType} from '../../../utils/cards'
import {swapSlots} from '../../../utils/movement'
import SingleUseCard from '../../base/single-use-card'

class LadderSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'ladder',
			numericId: 143,
			name: 'Ladder',
			rarity: 'ultra_rare',
			description:
				'Swap your active Hermit card with one of your adjacent AFK Hermits.\n\nAll cards attached to both Hermits, including health, remain in place.\n\nActive and AFK status does not change.',
		})
	}

	override canAttach(game: GameModel, pos: CardPosModel) {
		const canAttach = super.canAttach(game, pos)
		if (canAttach !== 'YES') return canAttach

		const playerBoard = pos.player.board
		const activeRowIndex = playerBoard.activeRow
		if (activeRowIndex === null) return 'NO'

		const adjacentRowsIndex = [activeRowIndex - 1, activeRowIndex + 1].filter(
			(index) => index >= 0 && index < playerBoard.rows.length
		)
		for (const index of adjacentRowsIndex) {
			const row = playerBoard.rows[index]
			if (!isCardType(row.hermitCard, 'hermit')) continue
			if (row.hermitCard !== null) return 'YES'
		}

		return 'NO'
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		game.addPickRequest({
			playerId: player.id,
			id: this.id,
			message: 'Pick an AFK Hermit adjacent to your active Hermit',
			onResult(pickResult) {
				if (pickResult.playerId !== player.id) return 'FAILURE_WRONG_PLAYER'

				if (pickResult.slot.type !== 'hermit') return 'FAILURE_INVALID_SLOT'
				if (!pickResult.card) return 'FAILURE_INVALID_SLOT'
				if (!isCardType(pickResult.card, 'hermit')) return 'FAILURE_CANNOT_COMPLETE'

				// Row picked must be an adjacent one
				const pickedIndex = pickResult.rowIndex
				if (pickedIndex === undefined) return 'FAILURE_INVALID_SLOT'
				const activeRowIndex = player.board.activeRow
				if (pickedIndex === activeRowIndex || activeRowIndex === null) return 'FAILURE_INVALID_SLOT'
				const adjacentRowsIndex = [activeRowIndex - 1, activeRowIndex + 1].filter(
					(index) => index >= 0 && index < player.board.rows.length
				)
				if (!adjacentRowsIndex.includes(pickedIndex)) return 'FAILURE_INVALID_SLOT'

				const activeRow = player.board.rows[activeRowIndex]
				const row = player.board.rows[pickedIndex]
				if (!row || !row.health) return 'FAILURE_INVALID_SLOT'

				// Apply
				applySingleUse(game)

				// Swap slots
				const activePos: SlotPos = {
					rowIndex: activeRowIndex,
					row: activeRow,
					slot: {
						index: 0,
						type: 'hermit',
					},
				}
				const inactivePos: SlotPos = {
					rowIndex: pickedIndex,
					row,
					slot: {
						index: 0,
						type: 'hermit',
					},
				}

				swapSlots(game, activePos, inactivePos, true)
				game.changeActiveRow(player, pickedIndex)

				return 'SUCCESS'
			},
		})
	}

	override getExpansion() {
		return 'alter_egos'
	}
}

export default LadderSingleUseCard
