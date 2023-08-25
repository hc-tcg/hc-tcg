import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {isRemovable} from '../../utils/cards'
import {discardCard} from '../../utils/movement'
import SingleUseCard from '../base/single-use-card'

class SweepingEdgeSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'sweeping_edge',
			numericId: 148,
			name: 'Sweeping Edge',
			rarity: 'ultra_rare',
			description:
				'Opponent must discard any effect cards attached to their active Hermit and adjacent Hermits.',
		})
	}

	override canAttach(game: GameModel, pos: CardPosModel) {
		const canAttach = super.canAttach(game, pos)
		if (canAttach !== 'YES') return canAttach

		const {opponentPlayer} = pos
		const activeRow = opponentPlayer.board.activeRow
		if (activeRow === null) return 'NO'

		const rows = opponentPlayer.board.rows
		const targetIndex = [activeRow - 1, activeRow, activeRow + 1].filter(
			(index) => index >= 0 && index < rows.length
		)

		for (const row of targetIndex) {
			const effectCard = rows[row].effectCard
			if (effectCard && isRemovable(effectCard)) return 'YES'
		}

		return 'NO'
	}

	override canApply() {
		return true
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {opponentPlayer, player} = pos

		player.hooks.onApply.add(instance, (pickedSlots, modalResult) => {
			const activeRow = opponentPlayer.board.activeRow
			if (activeRow === null) return

			const rows = opponentPlayer.board.rows
			const targetIndex = [activeRow - 1, activeRow, activeRow + 1].filter(
				(index) => index >= 0 && index < rows.length
			)

			for (const index of targetIndex) {
				const effectCard = rows[index].effectCard
				if (effectCard && isRemovable(effectCard)) discardCard(game, effectCard)
			}
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

export default SweepingEdgeSingleUseCard
