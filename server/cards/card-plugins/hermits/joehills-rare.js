import HermitCard from './_hermit-card'
import {flipCoin} from '../../../utils'

class JoeHillsRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'joehills_rare',
			name: 'Joe',
			rarity: 'rare',
			hermitType: 'farm',
			health: 270,
			primary: {
				name: 'Grow Hills',
				cost: ['farm'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Time Skip',
				cost: ['farm', 'farm', 'any'],
				damage: 90,
				power:
					'Flip a Coin.\n\nIf heads, opponent skips next turn.\n\nCannot be used consecutively.',
			},
		})
	}

	register(game) {
		game.hooks.turnStart.tap(this.id, (derivedState) => {
			const {currentPlayer} = derivedState
			if (currentPlayer.custom[this.id] === 1) {
				console.log('Turn skipped')
				currentPlayer.custom[this.id] = 2
				return 'SKIP'
			} else if (currentPlayer.custom[this.id]) {
				delete currentPlayer.custom[this.id]
			}
		})

		game.hooks.attack.tap(this.id, (target, turnAction, derivedState) => {
			const {attackerHermitCard, currentPlayer, typeAction, opponentPlayer} =
				derivedState

			if (typeAction !== 'SECONDARY_ATTACK') return target
			if (!target.isActive) return target
			if (attackerHermitCard.cardId !== this.id) return target

			// can't be used on first turn
			if (game.state.turn < 2) return target
			// can't be used consecutively
			if (opponentPlayer.custom[this.id]) return target

			const coinFlip = flipCoin(currentPlayer)
			currentPlayer.coinFlips[this.id] = coinFlip

			if (coinFlip[0] === 'tails') return target
			opponentPlayer.custom[this.id] = 1

			return target
		})
	}
}

export default JoeHillsRareHermitCard
