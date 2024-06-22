import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {slot} from '../../../slot'
import {applySingleUse} from '../../../utils/board'
import {getSlotCard, swapSlots} from '../../../utils/movement'
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

	pickCondition = slot.every(
		slot.player,
		slot.hermitSlot,
		slot.not(slot.empty),
		slot.adjacentTo(slot.activeRow)
	)

	override _attachCondition = slot.every(
		super.attachCondition,
		slot.someSlotFulfills(this.pickCondition)
	)

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		game.addPickRequest({
			playerId: player.id,
			id: this.id,
			message: 'Pick an AFK Hermit adjacent to your active Hermit',
			canPick: this.pickCondition,
			onResult(pickResult) {
				if (!pickResult.card || pickResult.rowIndex === null) return

				const activePos = game.getSlot(slot.every(slot.player, slot.activeRow, slot.hermitSlot))
				const inactivePos = game.getSlot(slot.every(slot.player, slot.rowIndex(pickResult.rowIndex), slot.hermitSlot))
				// Apply
				applySingleUse(game)

				// Swap slots
				swapSlots(game, activePos, inactivePos, true)

				game.changeActiveRow(player, pickResult.rowIndex)
			},
		})
	}

	override getExpansion() {
		return 'alter_egos'
	}
}

export default LadderSingleUseCard
