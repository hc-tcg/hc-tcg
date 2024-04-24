import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import SingleUseCard from '../../base/single-use-card'
import {applyStatusEffect} from '../../../utils/board'

class BadOmenSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'bad_omen',
			numericId: 139,
			name: 'Bad Omen',
			rarity: 'rare',
			description: `Give the opposing active hermit bad omen for the next 3 turns.`,
		})
	}

	override canApply() {
		return true
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {opponentPlayer, player} = pos
		const activeRow = opponentPlayer.board.activeRow
		if (activeRow === null) return

		player.hooks.onApply.add(instance, () => {
			applyStatusEffect(
				game,
				'badomen',
				opponentPlayer.board.rows[activeRow].hermitCard?.cardInstance
			)
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onApply.remove(instance)
	}

	override canAttach(game: GameModel, pos: CardPosModel) {
		const {opponentPlayer} = pos

		const canAttach = super.canAttach(game, pos)
		if (canAttach !== 'YES') return canAttach

		const activeRow = opponentPlayer.board.activeRow
		if (activeRow === null) return 'NO'

		return 'YES'
	}

	override getExpansion() {
		return 'alter_egos'
	}

	override sidebarDescriptions() {
		return [
			{
				type: 'statusEffect',
				name: 'badomen',
			},
		]
	}
}

export default BadOmenSingleUseCard
