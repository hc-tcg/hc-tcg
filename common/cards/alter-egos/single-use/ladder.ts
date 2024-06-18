import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {slot} from '../../../slot'
import {applySingleUse, getActiveRow, getSlotPos} from '../../../utils/board'
import {canAttachToSlot, getSlotCard, swapSlots} from '../../../utils/movement'
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

	override _attachCondition = slot.every(super.attachCondition, (game, pos) => {
		const activeRow = getActiveRow(pos.player)
		const activeRowIndex = pos.player.board.activeRow
		if (activeRow === null || activeRowIndex === null) return false
		const activeHermitSlot = getSlotPos(pos.player, activeRowIndex, 'hermit')

		return pos.player.board.rows.some((row, index) => {
			if (!row.hermitCard) return false
			if (index === activeRowIndex) return false
			if (index + 1 !== activeRowIndex && index - 1 !== activeRowIndex) return false
			return true
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
