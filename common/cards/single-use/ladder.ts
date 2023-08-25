import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {SlotPos} from '../../types/cards'
import {isCardType} from '../../utils/cards'
import {swapSlots} from '../../utils/movement'
import SingleUseCard from '../base/single-use-card'

class LadderSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'ladder',
			numeric_id: 143,
			name: 'Ladder',
			rarity: 'ultra_rare',
			description:
				'Swap your active Hermit card with one of your adjacent AFK Hermits.\n\nAll cards attached to both Hermits, including health, remain in place.\n\nActive and AFK status does not change.',

			pickOn: 'apply',
			pickReqs: [
				{
					target: 'player',
					slot: ['hermit'],
					type: ['hermit'],
					amount: 1,
					adjacent: 'active',
				},
			],
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.onApply.add(instance, (pickedSlots, modalResult) => {
			const slots = pickedSlots[this.id] || []
			const activeRowIndex = player.board.activeRow

			if (slots.length !== 1 || activeRowIndex === null) return

			const playerActiveRow = player.board.rows[activeRowIndex]

			const inactiveHermitCardInfo = slots[0]
			const inactiveHermitCard = inactiveHermitCardInfo.slot.card

			if (inactiveHermitCard === null || !inactiveHermitCardInfo.row) return

			// Swap ailments
			const activeRowAilments = playerActiveRow.ailments
			const inactiveRowAilments = inactiveHermitCardInfo.row.state.ailments
			playerActiveRow.ailments = inactiveRowAilments
			inactiveHermitCardInfo.row.state.ailments = activeRowAilments

			const inactivePos: SlotPos = {
				rowIndex: activeRowIndex,
				row: playerActiveRow,
				slot: {
					index: 0,
					type: 'hermit',
				},
			}
			const activePos: SlotPos = {
				rowIndex: inactiveHermitCardInfo.row.index,
				row: inactiveHermitCardInfo.row.state,
				slot: {
					index: 0,
					type: 'hermit',
				},
			}

			swapSlots(game, activePos, inactivePos, true)

			player.board.activeRow = inactiveHermitCardInfo.row.index
		})
	}

	override canAttach(game: GameModel, pos: CardPosModel) {
		const canAttach = super.canAttach(game, pos)
		if (canAttach !== 'YES') return canAttach

		const playerBoard = pos.player.board
		const activeRowIndex = playerBoard.activeRow
		if (activeRowIndex === null) return 'NO'

		const adjacentRowsIndex = [activeRowIndex - 1, activeRowIndex + 1].filter(
			(index) => index >= 0 && index < playerBoard.rows.length
		)
		for (const index of adjacentRowsIndex) {
			const row = playerBoard.rows[index]
			if (!isCardType(row.hermitCard, 'hermit')) continue
			if (row.hermitCard !== null) return 'YES'
		}

		return 'NO'
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onApply.remove(instance)
	}

	override getExpansion() {
		return 'alter_egos'
	}
}

export default LadderSingleUseCard
