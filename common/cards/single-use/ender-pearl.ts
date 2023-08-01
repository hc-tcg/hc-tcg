import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import SingleUseCard from '../base/single-use-card'

class EnderPearlSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'ender_pearl',
			name: 'Ender Pearl',
			rarity: 'common',
			description:
				'Move your active Hermit and any attached cards to an open slot on your board.\n\nSubtract 10 health from this Hermit.',

			pickOn: 'apply',
			pickReqs: [
				{
					target: 'player',
					slot: ['hermit'],
					amount: 1,
					empty: true,
					emptyRow: true,
				},
			],
		})
	}

	override canAttach(game: GameModel, pos: CardPosModel) {
		if (super.canAttach(game, pos) === 'INVALID') return 'INVALID'
		const {player} = pos
		for (const row of player.board.rows) {
			if (row.hermitCard === null) return 'YES'
		}
		return 'NO'
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.onApply.add(instance, (pickedSlots, modalResult) => {
			const slots = pickedSlots[this.id] || []

			if (slots.length !== 1) return

			const pickedSlot = slots[0]
			if (player.board.activeRow === null || !pickedSlot.row) return

			const activeRow = player.board.rows[player.board.activeRow]
			if (activeRow.health) activeRow.health -= 10
			player.board.rows[pickedSlot.row.index] = activeRow
			player.board.rows[player.board.activeRow] = pickedSlot.row.state
			player.board.activeRow = pickedSlot.row.index
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onApply.remove(instance)
	}

	override getExpansion() {
		return 'alter_egos'
	}
}

export default EnderPearlSingleUseCard
