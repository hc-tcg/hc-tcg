import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {SlotPos} from '../../types/cards'
import {
	applySingleUse,
	canAttachToCard,
	getActiveRowPos,
	isRowEmpty,
	rowHasEmptyItemSlot,
} from '../../utils/board'
import {isCardType} from '../../utils/cards'
import {discardSingleUse, swapSlots} from '../../utils/movement'
import SingleUseCard from '../base/single-use-card'

class PistonSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'piston',
			numericId: 144,
			name: 'Piston',
			rarity: 'common',
			description:
				'Move 1 of your attached item cards to an adjacent active or AFK Hermit. You can use another single use effect card this turn.',
		})
	}

	override canAttach(game: GameModel, pos: CardPosModel) {
		const canAttach = super.canAttach(game, pos)
		if (canAttach !== 'YES') return canAttach

		const playerBoard = pos.player.board
		const activeRowIndex = playerBoard.activeRow
		if (activeRowIndex === null) return 'NO'
		const activeRow = playerBoard.rows[activeRowIndex]
		if (!activeRow || !activeRow.hermitCard) return 'NO'

		const adjacentRowsIndex = [activeRowIndex - 1, activeRowIndex + 1].filter(
			(index) => index >= 0 && index < playerBoard.rows.length
		)
		for (const index of adjacentRowsIndex) {
			const row = playerBoard.rows[index]
			if (!row.hermitCard) continue
			if (!isCardType(row.hermitCard, 'hermit')) continue
			if (!rowHasEmptyItemSlot(activeRow)) continue
			if (isRowEmpty(activeRow)) continue
			return 'YES'
		}

		return 'NO'
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		const itemIndexKey = this.getInstanceKey(instance, 'itemIndex')

		game.addPickRequest({
			playerId: player.id,
			id: this.id,
			message: 'Pick an item card from your active Hermit',
			onResult(pickResult) {
				if (pickResult.playerId !== player.id) return 'FAILURE_WRONG_PLAYER'

				const rowIndex = pickResult.rowIndex
				if (rowIndex === undefined) return 'FAILURE_INVALID_SLOT'
				if (rowIndex !== player.board.activeRow) return 'FAILURE_INVALID_SLOT'

				if (pickResult.slot.type !== 'item') return 'FAILURE_INVALID_SLOT'
				if (!pickResult.card) return 'FAILURE_INVALID_SLOT'

				// Store the index of the chosen item
				player.custom[itemIndexKey] = pickResult.slot.index

				return 'SUCCESS'
			},
		})
		game.addPickRequest({
			playerId: player.id,
			id: this.id,
			message: 'Pick an empty item slot on one of your adjacent AFK Hermits',
			onResult(pickResult) {
				if (pickResult.playerId !== player.id) return 'FAILURE_WRONG_PLAYER'

				const pickedIndex = pickResult.rowIndex
				if (pickedIndex === undefined) return 'FAILURE_INVALID_SLOT'
				if (pickedIndex === player.board.activeRow) return 'FAILURE_INVALID_SLOT'

				const row = player.board.rows[pickedIndex]
				if (!row) return 'FAILURE_INVALID_SLOT'

				if (pickResult.slot.type !== 'item') return 'FAILURE_INVALID_SLOT'
				// Slot must be empty
				if (pickResult.card) return 'FAILURE_INVALID_SLOT'

				// Get the index of the chosen item
				const itemIndex: number | undefined = player.custom[itemIndexKey]

				const activePos = getActiveRowPos(player)

				if (itemIndex === undefined || !activePos) {
					// Something went wrong, just return success
					// To clarify, the problem here is that if itemIndex is null this pick request will never be able to succeed if we don't do this
					// @TODO is a better failsafe mechanism needed for 2 picks in a row? Same as lead
					return 'SUCCESS'
				}

				// Make sure we are adjacent
				const adjacentRowsIndex = [activePos.rowIndex - 1, activePos.rowIndex + 1].filter(
					(index) => index >= 0 && index < player.board.rows.length
				)
				if (!adjacentRowsIndex.includes(pickedIndex)) return 'FAILURE_INVALID_SLOT'

				// Make sure we can attach the item
				const itemCard = activePos.row.itemCards[itemIndex]
				if (!canAttachToCard(game, row.hermitCard, itemCard)) return 'FAILURE_INVALID_SLOT'

				// Move the item
				const itemPos: SlotPos = {
					rowIndex: activePos.rowIndex,
					row: activePos.row,
					slot: {
						index: itemIndex,
						type: 'item',
					},
				}

				const targetPos: SlotPos = {
					rowIndex: pickedIndex,
					row,
					slot: {
						index: pickResult.slot.index,
						type: 'item',
					},
				}

				swapSlots(game, itemPos, targetPos)

				// Only add the after apply hook here
				player.hooks.afterApply.add(instance, () => {
					discardSingleUse(game, player)

					// Remove playing a single use from completed actions so it can be done again
					game.removeCompletedActions('PLAY_SINGLE_USE_CARD')

					player.hooks.afterApply.remove(instance)
				})

				applySingleUse(game)
				delete player.custom[itemIndexKey]

				return 'SUCCESS'
			},
		})
	}

	override getExpansion() {
		return 'alter_egos'
	}
}

export default PistonSingleUseCard
