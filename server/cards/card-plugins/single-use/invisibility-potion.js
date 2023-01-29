import SingleUseCard from './_single-use-card'
import {applySingleUse, flipCoin} from '../../../utils'

class InvisibilityPotionSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'invisibility_potion',
			name: 'Invisibility Potion',
			rarity: 'rare',
			description:
				"Flip a Coin.\n\nIf heads, no damage is done on opponent's next turn. If tails, double damage is done.\n\nDiscard after use.",
		})
		this.multiplier = 2
	}
	register(game) {
		game.hooks.applyEffect.tap(this.id, (action, derivedState) => {
			const {singleUseInfo, currentPlayer} = derivedState
			if (singleUseInfo?.id === this.id) {
				currentPlayer.coinFlips[this.id] = flipCoin()
				return 'DONE'
			}
		})

		game.hooks.attack.tap(this.id, (target, turnAction, derivedState) => {
			const {board, coinFlips} = derivedState.currentPlayer
			const isInvisCard = board.singleUseCard?.cardId === this.id
			const isUsed = board.singleUseCardUsed

			if (isInvisCard && isUsed && coinFlips[this.id]) {
				if (coinFlips[this.id] === 'heads') {
					target.multiplier *= this.multiplier
				} else if (coinFlips[this.id] === 'tails') {
					target.multiplier = 0
				}
				delete derivedState.currentPlayer.coinFlips[this.id]
			}
			return target
		})
	}
}

export default InvisibilityPotionSingleUseCard
