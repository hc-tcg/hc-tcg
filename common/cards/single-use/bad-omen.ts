import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import SingleUseCard from '../base/single-use-card'

class BadOmenSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'bad_omen',
			name: 'Bad Omen',
			rarity: 'rare',
			description: `Give the opposing active hermit bad omen for the next 3 turns.\n\nWhile they have this effect, all of their coin flips are tails.`,
		})
	}

	override canApply() {
		return true
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {opponentPlayer, player} = pos
		const activeRow = opponentPlayer.board.activeRow
		if (activeRow === null) return

		player.hooks.onApply.add(instance, (pickedSlots, modalResult) => {
			opponentPlayer.board.rows[activeRow].ailments.push({
				id: 'badomen',
				duration: 3,
			})
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onApply.remove(instance)
	}

	override canAttach(game: GameModel, pos: CardPosModel) {
		if (super.canAttach(game, pos) === 'INVALID') return 'INVALID'
		const {opponentPlayer} = pos
		const activeRow = opponentPlayer.board.activeRow
		if (activeRow === null) return 'NO'

		return 'YES'
	}

	override getExpansion() {
		return 'alter_egos'
	}
}

export default BadOmenSingleUseCard
