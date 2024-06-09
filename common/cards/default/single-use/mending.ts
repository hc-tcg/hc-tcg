import {CARDS} from '../..'
import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {applySingleUse, getActiveRow, getNonEmptyRows, getSlotPos} from '../../../utils/board'
import {isRemovable} from '../../../utils/cards'
import {canAttachToSlot, discardSingleUse, getSlotCard, swapSlots} from '../../../utils/movement'
import {CanAttachResult} from '../../base/card'
import singleUseCard from '../../base/single-use-card'

class MendingSingleUseCard extends singleUseCard {
	constructor() {
		super({
			id: 'mending',
			numericId: 78,
			name: 'Mending',
			rarity: 'ultra_rare',
			description: "Move your active Hermit's attached effect card to any of your AFK Hermits.",
			log: (values) =>
				`${values.defaultLog} to move $e${values.pick.name}$ to $p${values.pick.hermitCard}$`,
		})
	}

	override canAttach(game: GameModel, pos: CardPosModel): CanAttachResult {
		const {player} = pos

		const result = super.canAttach(game, pos)

		const effectCard = getActiveRow(player)?.effectCard
		if (effectCard && isRemovable(effectCard)) {
			// check if there is an empty slot available to move the effect card to
			const inactiveRows = getNonEmptyRows(player, true)
			for (const rowPos of inactiveRows) {
				if (rowPos.row.effectCard) continue
				const slotPos = getSlotPos(player, rowPos.rowIndex, 'effect')
				const canAttach = canAttachToSlot(game, slotPos, effectCard, true)

				if (canAttach.length > 0) continue

				return result
			}
		}

		return [...result, 'UNMET_CONDITION']
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
				if (pickResult.playerId !== player.id) return 'FAILURE_INVALID_PLAYER'

				const rowIndex = pickResult.rowIndex
				if (rowIndex === undefined) return 'FAILURE_INVALID_SLOT'
				if (rowIndex === player.board.activeRow) return 'FAILURE_INVALID_SLOT'

				if (pickResult.slot.type !== 'effect') return 'FAILURE_INVALID_SLOT'
				if (pickResult.card) return 'FAILURE_INVALID_SLOT'

				const row = player.board.rows[rowIndex]
				if (!row.hermitCard) return 'FAILURE_INVALID_SLOT'

				// Make sure we can attach the item
				const sourcePos = getSlotPos(player, activeRowIndex, 'effect')
				const targetPos = getSlotPos(player, rowIndex, 'effect')
				const effectCard = getSlotCard(sourcePos)!
				if (canAttachToSlot(game, targetPos, effectCard, true).length > 0) {
					return 'FAILURE_INVALID_SLOT'
				}

				const logInfo = pickResult
				logInfo.card = sourcePos.row.effectCard

				// Apply the mending card
				applySingleUse(game, logInfo)

				// Move the effect card
				swapSlots(game, sourcePos, targetPos)

				return 'SUCCESS'
			},
		})
	}
}

export default MendingSingleUseCard
