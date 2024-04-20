import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {canAttachToCard, getSlotPos} from '../../../utils/board'
import {isRemovable} from '../../../utils/cards'
import {canAttachToSlot, swapSlots} from '../../../utils/movement'
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

	override canAttach(game: GameModel, pos: CardPosModel) {
		const canAttach = super.canAttach(game, pos)
		if (canAttach !== 'YES') return canAttach

		const {player, opponentPlayer} = pos
		const playerActiveRowIndex = player.board.activeRow
		const opponentActiveRowIndex = opponentPlayer.board.activeRow

		if (playerActiveRowIndex === null || opponentActiveRowIndex === null) return 'NO'

		const opponentActiveRow = opponentPlayer.board.rows[opponentActiveRowIndex]
		const playerActiveRow = player.board.rows[playerActiveRowIndex]

		const opponentEffect = opponentActiveRow.effectCard
		const playerEffect = playerActiveRow.effectCard
		const opponentHermit = opponentActiveRow.hermitCard
		const playerHermit = playerActiveRow.hermitCard

		// If either card can't be placed in the other slot, don't attach
		const playerEffectSlot = getSlotPos(player, playerActiveRowIndex, 'effect')
		const opponentEffectSlot = getSlotPos(opponentPlayer, opponentActiveRowIndex, 'effect')

		if (playerEffect) {
			if (!['YES', 'MOVE_ONLY'].includes(canAttachToSlot(game, opponentEffectSlot, playerEffect)))
				return 'NO'
			if (!canAttachToCard(game, playerEffect, opponentHermit)) return 'NO'
			if (!isRemovable(playerEffect)) return 'NO'
		}

		if (opponentEffect) {
			if (!['YES', 'MOVE_ONLY'].includes(canAttachToSlot(game, playerEffectSlot, opponentEffect)))
				return 'NO'
			if (!canAttachToCard(game, opponentEffect, playerHermit)) return 'NO'
			if (!isRemovable(opponentEffect)) return 'NO'
		}

		return 'YES'
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
