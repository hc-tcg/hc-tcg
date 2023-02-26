import SingleUseCard from './_single-use-card'
import {discardCard} from '../../../utils'

// TODO - Can't use with no active hermit
class FlintAndSteelSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'flint_&_steel',
			name: 'Flint & Steel',
			rarity: 'common',
			description: 'Discard your hand. Draw 3 cards.\n\nDiscard after use.',
		})
	}
	register(game) {
		game.hooks.applyEffect.tap(this.id, () => {
			const {singleUseInfo, currentPlayer} = game.ds

			if (singleUseInfo?.id === this.id) {
				currentPlayer.hand.forEach((card) => discardCard(game, card))
				for (let i = 0; i < 3; i++) {
					const drawCard = currentPlayer.pile.shift()
					if (drawCard) currentPlayer.hand.push(drawCard)
				}
				return 'DONE'
			}
		})
	}
}

export default FlintAndSteelSingleUseCard
