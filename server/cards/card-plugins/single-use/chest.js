import SingleUseCard from './_single-use-card'
import {equalCard} from '../../../utils'

// TODO wrap card-list if there is too many cards in discard (+ scroll)
class ChestSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'chest',
			name: 'Chest',
			rarity: 'rare',
			description:
				'Look through discard pile and select 1 card to return to hand.\n\nDiscard after use.',
		})
	}

	register(game) {
		game.hooks.applyEffect.tap(this.id, (action, derivedState) => {
			const {singleUseInfo, currentPlayer, opponentPlayer} = derivedState

			if (singleUseInfo?.id === this.id) {
				const selectedCard = action.payload
				if (!selectedCard) return 'INVALID'
				const discardedCard = currentPlayer.discarded.find((card) =>
					equalCard(card, selectedCard)
				)
				if (!discardedCard) return 'INVALID'
				currentPlayer.discarded = currentPlayer.discarded.filter(
					(card) => !equalCard(card, selectedCard)
				)
				currentPlayer.hand.push(discardedCard)
				return 'DONE'
			}
		})
	}
}

export default ChestSingleUseCard
