import SingleUseCard from './_single-use-card'
import {discardCard} from '../../../utils'

class CurseOfVanishingSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'curse_of_vanishing',
			name: 'Curse Of Vanishing',
			rarity: 'common',
			description:
				"Opponent is forced to discard their active Hermit's attached effect card.\n\nDiscard after use.",
		})

		this.useReqs = [
			{target: 'opponent', type: 'effect', amount: 1, active: true},
		]
	}
	register(game) {
		game.hooks.applyEffect.tap(this.id, (action, derivedState) => {
			const {singleUseInfo, opponentPlayer} = derivedState

			if (singleUseInfo?.id === this.id) {
				const activeRow = opponentPlayer.board.activeRow
				if (activeRow === null) return 'INVALID'
				const activeRowState = opponentPlayer.board.rows[activeRow]
				if (!activeRowState) return 'INVALID'
				if (activeRowState.effectCard) {
					discardCard(game, activeRowState.effectCard)
				}
				return 'DONE'
			}
		})
	}
}

export default CurseOfVanishingSingleUseCard
