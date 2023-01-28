import SingleUseCard from './_single-use-card'
import {equalCard} from '../../../utils'

class SpyglassSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'spyglass',
			name: 'Spyglass',
			rarity: 'rare',
			description:
				"Reveal 3 random opponent's cards in their hand.\n\nDiscard after use.",
		})
	}

	removeSpyglass(game) {
		Object.values(game.state.players).forEach((pState) => {
			delete pState.custom[this.id]
		})
	}

	register(game) {
		game.hooks.turnStart.tap(this.id, (action, derivedState) => {
			this.removeSpyglass(game)
		})

		game.hooks.actionStart.tap(this.id, (action, derivedState) => {
			this.removeSpyglass(game)
		})

		game.hooks.applyEffect.tap(this.id, (action, derivedState) => {
			const {singleUseInfo, currentPlayer, opponentPlayer} = derivedState

			if (singleUseInfo?.id === this.id) {
				const randomCards = opponentPlayer.hand
					.slice()
					.sort(() => 0.5 - Math.random())
					.slice(0, 3)
				currentPlayer.custom[this.id] = randomCards
				return 'DONE'
			}
		})
	}
}

export default SpyglassSingleUseCard
