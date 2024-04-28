import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {getSlotPos} from '../../../utils/board'
import {isRemovable} from '../../../utils/cards'
import {canAttachToSlot, swapSlots} from '../../../utils/movement'
import {CanAttachResult} from '../../base/card'
import SingleUseCard from '../../base/single-use-card'

class EmeraldSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'emerald',
			numericId: 18,
			name: 'Emerald',
			rarity: 'rare',
			description: "Steal or swap the attached effect card of your opponent's active Hermit.",
		})
	}

	override canAttach(game: GameModel, pos: CardPosModel): CanAttachResult {
		const result = super.canAttach(game, pos)

		const {player, opponentPlayer} = pos
		const playerActiveRowIndex = player.board.activeRow
		const opponentActiveRowIndex = opponentPlayer.board.activeRow

		if (playerActiveRowIndex === null || opponentActiveRowIndex === null) {
			result.push('UNMET_CONDITION')
		} else {
			const opponentActiveRow = opponentPlayer.board.rows[opponentActiveRowIndex]
			const playerActiveRow = player.board.rows[playerActiveRowIndex]

			const opponentEffect = opponentActiveRow.effectCard
			const playerEffect = playerActiveRow.effectCard

			// If either card can't be placed in the other slot, don't attach
			const playerEffectSlot = getSlotPos(player, playerActiveRowIndex, 'effect')
			const opponentEffectSlot = getSlotPos(opponentPlayer, opponentActiveRowIndex, 'effect')

			if (playerEffect) {
				const canAttach = canAttachToSlot(game, opponentEffectSlot, playerEffect, true)
				if (canAttach.length > 0) result.push('UNMET_CONDITION')
				if (!isRemovable(playerEffect)) result.push('UNMET_CONDITION')
			}

			if (opponentEffect) {
				const canAttach = canAttachToSlot(game, playerEffectSlot, opponentEffect, true)
				if (canAttach.length > 0) result.push('UNMET_CONDITION')
				if (!isRemovable(opponentEffect)) result.push('UNMET_CONDITION')
			}
		}

		return result
	}

	override canApply() {
		return true
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		const playerActiveRowIndex = player.board.activeRow
		const opponentActiveRowIndex = opponentPlayer.board.activeRow

		player.hooks.onApply.add(instance, () => {
			if (playerActiveRowIndex === null || opponentActiveRowIndex === null) return

			const playerSlot = getSlotPos(player, playerActiveRowIndex, 'effect')
			const opponentSlot = getSlotPos(opponentPlayer, opponentActiveRowIndex, 'effect')

			swapSlots(game, playerSlot, opponentSlot)
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onApply.remove(instance)
	}
}

export default EmeraldSingleUseCard
