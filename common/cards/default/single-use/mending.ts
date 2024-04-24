import {CARDS} from '../..'
import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {
	applySingleUse,
	canAttachToCard,
	getActiveRow,
	getNonEmptyRows,
	getSlotPos,
} from '../../../utils/board'
import {isRemovable} from '../../../utils/cards'
import {canAttachToSlot, discardSingleUse, swapSlots} from '../../../utils/movement'
import singleUseCard from '../../base/single-use-card'

class MendingSingleUseCard extends singleUseCard {
	constructor() {
		super({
			id: 'mending',
			numericId: 78,
			name: 'Mending',
			rarity: 'ultra_rare',
			description: "Move your active Hermit's attached effect card to any of your AFK Hermits.",
		})
	}

	override canAttach(game: GameModel, pos: CardPosModel) {
		const canAttach = super.canAttach(game, pos)
		if (canAttach !== 'YES') return canAttach
		const {player} = pos

		if (player.board.activeRow === null) return 'NO'

		const effectCard = getActiveRow(player)?.effectCard
		if (!effectCard || !isRemovable(effectCard)) return 'NO'

		// check if there is an empty slot available to move the effect card to
		const inactiveRows = getNonEmptyRows(player, true)
		for (const rowPos of inactiveRows) {
			if (rowPos.row.effectCard) continue

			const attachToCard = canAttachToCard(game, rowPos.row.hermitCard, effectCard)
			const slotPos = getSlotPos(player, rowPos.rowIndex, 'effect')
			const attachToSlot = canAttachToSlot(game, slotPos, effectCard)

			if (attachToCard && attachToSlot) return 'YES'
		}

		return 'NO'
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		const activeRowIndex = player.board.activeRow
		if (activeRowIndex === null) {
			discardSingleUse(game, player)
			return
		}

		const activeRow = getActiveRow(player)
		if (!activeRow) {
			discardSingleUse(game, player)
			return
		}
		const effectCard = activeRow.effectCard
		if (!effectCard) {
			discardSingleUse(game, player)
			return
		}

		game.addPickRequest({
			playerId: player.id,
			id: this.id,
			message: 'Pick an empty effect slot from one of your afk Hermits',
			onResult(pickResult) {
				if (pickResult.playerId !== player.id) return 'FAILURE_WRONG_PLAYER'

				const rowIndex = pickResult.rowIndex
				if (rowIndex === undefined) return 'FAILURE_INVALID_SLOT'
				if (rowIndex === player.board.activeRow) return 'FAILURE_INVALID_SLOT'

				if (pickResult.slot.type !== 'effect') return 'FAILURE_INVALID_SLOT'
				if (pickResult.card) return 'FAILURE_INVALID_SLOT'

				const row = player.board.rows[rowIndex]
				if (!row.hermitCard) return 'FAILURE_INVALID_SLOT'

				if (!canAttachToCard(game, row.hermitCard, effectCard)) return 'FAILURE_CANNOT_COMPLETE'

				// Apply the mending card
				applySingleUse(game, [
					[`to move `, 'plain'],
					[`${CARDS[effectCard.cardId].name} `, 'player'],
				])

				// Move the effect card
				const sourcePos = getSlotPos(player, activeRowIndex, 'effect')
				const targetPos = getSlotPos(player, rowIndex, 'effect')
				swapSlots(game, sourcePos, targetPos)

				return 'SUCCESS'
			},
		})
	}
}

export default MendingSingleUseCard
