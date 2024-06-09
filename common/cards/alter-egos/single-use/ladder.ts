import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {applySingleUse, getSlotPos} from '../../../utils/board'
import {isCardType} from '../../../utils/cards'
import {canAttachToSlot, getSlotCard, swapSlots} from '../../../utils/movement'
import {CanAttachResult} from '../../base/card'
import SingleUseCard from '../../base/single-use-card'

class LadderSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'ladder',
			numericId: 143,
			name: 'Ladder',
			rarity: 'ultra_rare',
			description:
				'Before your attack, swap your active Hermit card with one of your adjacent AFK Hermit cards.\nAll cards attached to both Hermits, including health, remain in place. Your active Hermit remains active after swapping.',
		})
	}

	override canAttach(game: GameModel, pos: CardPosModel): CanAttachResult {
		const result = super.canAttach(game, pos)

		const playerBoard = pos.player.board
		const activeRowIndex = playerBoard.activeRow
		if (activeRowIndex !== null) {
			const activeRow = playerBoard.rows[activeRowIndex]
			if (activeRow.hermitCard) {
				// Check to see if there's a valid adjacent row to switch to
				const adjacentRowsIndex = [activeRowIndex - 1, activeRowIndex + 1].filter(
					(index) => index >= 0 && index < playerBoard.rows.length
				)

				for (const index of adjacentRowsIndex) {
					const row = playerBoard.rows[index]
					if (!row.hermitCard) continue

					const hermitSlot = getSlotPos(pos.player, index, 'hermit')
					if (canAttachToSlot(game, hermitSlot, activeRow.hermitCard, true).length > 0) continue

					// We found somewhere to attach
					return result
				}
			}
		}

		return [...result, 'UNMET_CONDITION']
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		game.addPickRequest({
			playerId: player.id,
			id: this.id,
			message: 'Pick an AFK Hermit adjacent to your active Hermit',
			onResult(pickResult) {
				if (pickResult.playerId !== player.id) return 'FAILURE_INVALID_PLAYER'

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

				const row = player.board.rows[pickedIndex]
				if (!row || !row.health) return 'FAILURE_INVALID_SLOT'

				const activePos = getSlotPos(player, activeRowIndex, 'hermit')
				const inactivePos = getSlotPos(player, pickedIndex, 'hermit')
				const card = getSlotCard(activePos)

				if (canAttachToSlot(game, inactivePos, card!, true).length > 0) {
					return 'FAILURE_INVALID_SLOT'
				}

				// Apply
				applySingleUse(game)

				// Swap slots
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
