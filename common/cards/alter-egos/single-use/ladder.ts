import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {slot, SlotCondition} from '../../../slot'
import {applySingleUse, getActiveRow, getSlotPos} from '../../../utils/board'
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

	override attachCondition = slot.every(this.attachCondition, (game, pos) => {
		const activeRow = getActiveRow(pos.player)
		if (!activeRow) return false
		return pos.player.board.rows.some((row, index) => {
			if (index + 1 === pos.player.board.activeRow || index - 1 === pos.player.board.activeRow) {
				const hermitSlot = getSlotPos(pos.player, index, 'hermit')
				if (canAttachToSlot(game, hermitSlot, activeRow.hermitCard)) return true
			}
			return false
		})
	})

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		game.addPickRequest({
			playerId: player.id,
			id: this.id,
			message: 'Pick an AFK Hermit adjacent to your active Hermit',
			canPick: slot.every(slot.player, slot.not(slot.empty), slot.hermitSlot, (game, pick) => {
				const pickedIndex = pick.rowIndex
				if (
					pickedIndex !== null &&
					(pickedIndex + 1 === pick.player.board.activeRow ||
						pickedIndex - 1 === pick.player.board.activeRow)
				) {
					return true
				}
				return false
			}),
			onResult(pickResult) {
				if (!pickResult.card || pickResult.rowIndex === undefined) return 'FAILURE_INVALID_SLOT'
				const activeRowIndex = player.board.activeRow
				if (activeRowIndex === null) return 'FAILURE_INVALID_DATA'

				const activePos = getSlotPos(player, activeRowIndex, 'hermit')
				const inactivePos = getSlotPos(player, pickResult.rowIndex, 'hermit')
				const card = getSlotCard(activePos)
				if (!card) return 'FAILURE_INVALID_DATA'

				if (canAttachToSlot(game, inactivePos, card)) return 'FAILURE_INVALID_SLOT'

				// Apply
				applySingleUse(game)

				// Swap slots
				swapSlots(game, activePos, inactivePos, true)

				game.changeActiveRow(player, pickResult.rowIndex)

				return 'SUCCESS'
			},
		})
	}

	override getExpansion() {
		return 'alter_egos'
	}
}

export default LadderSingleUseCard
