import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {SlotPos} from '../../types/cards'
import {applySingleUse, canAttachToCard, getActiveRow, getNonEmptyRows} from '../../utils/board'
import {isRemovable} from '../../utils/cards'
import {discardSingleUse, swapSlots} from '../../utils/movement'
import singleUseCard from '../base/single-use-card'

class MendingSingleUseCard extends singleUseCard {
	constructor() {
		super({
			id: 'mending',
			numericId: 78,
			name: 'Mending',
			rarity: 'ultra_rare',
			description: 'Move any attached effect card from your active Hermit to an AFK Hermit.',
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
		const inactiveHermits = getNonEmptyRows(player, false)
		for (const hermit of inactiveHermits) {
			if (!hermit) continue
			const effect = hermit.row.effectCard
			if (!effect || isRemovable(effect)) return 'YES'
		}

		// check if the effect card can be attached to any of the inactive hermits
		for (const hermit of inactiveHermits) {
			if (canAttachToCard(game, hermit.row.hermitCard, effectCard)) return 'YES'
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
				applySingleUse(game)

				// Move the effect card
				const sourcePos: SlotPos = {
					rowIndex: activeRowIndex,
					row: activeRow,
					slot: {
						type: 'effect',
						index: 0,
					},
				}

				const targetPos: SlotPos = {
					rowIndex,
					row: player.board.rows[rowIndex],
					slot: {
						type: 'effect',
						index: 0,
					},
				}

				swapSlots(game, sourcePos, targetPos)

				return 'SUCCESS'
			},
		})
	}
}

export default MendingSingleUseCard
