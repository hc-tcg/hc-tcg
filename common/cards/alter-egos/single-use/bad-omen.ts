import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import SingleUseCard from '../../base/single-use-card'
import {applyAilment} from '../../../utils/board'

class BadOmenSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'bad_omen',
			numericId: 139,
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

		player.hooks.onApply.add(instance, () => {
			applyAilment(game, 'badomen', opponentPlayer.board.rows[activeRow].hermitCard?.cardInstance)
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
}

export default BadOmenSingleUseCard
