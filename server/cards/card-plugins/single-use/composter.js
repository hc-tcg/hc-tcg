import SingleUseCard from './_single-use-card'
import {equalCard, discardCard} from '../../../utils'

// TODO - don't allow selecting the same card twice
// TODO - If there is is less cards in hand (1,0) limit the requirment or don't allow to use it
class ComposterSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'composter',
			name: 'Composter',
			rarity: 'common',
			description:
				'Discard 2 cards in you hand. Draw 2 cards.\n\nDiscard after use.',
		})
	}
	register(game) {
		game.hooks.applyEffect.tap(this.id, (action, derivedState) => {
			const {singleUseInfo, currentPlayer, pickedCardsInfo} = derivedState

			if (singleUseInfo?.id === this.id) {
				if (pickedCardsInfo.length !== 2) return 'INVALID'

				// discard two cards
				pickedCardsInfo.forEach((info) => discardCard(game.state, info.card))

				// draw two cards
				for (let i = 0; i < 2; i++) {
					const drawCard = currentPlayer.pile.shift()
					if (drawCard) currentPlayer.hand.push(drawCard)
				}
				return 'DONE'
			}
		})
	}
}

export default ComposterSingleUseCard
