import HermitCard from './_hermit-card'
import {flipCoin} from '../../../utils'
import CARDS from '../../../cards'

class PearlescentMoonRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'pearlescentmoon_rare',
			name: 'Pearl',
			rarity: 'rare',
			hermitType: 'terraform',
			health: 300,
			primary: {
				name: 'Cleaning Lady',
				cost: ['terraform'],
				damage: 60,
				power: null,
			},
			secondary: {
				name: 'Aussie Ping',
				cost: ['terraform', 'any'],
				damage: 70,
				power:
					'Opponent flips a coin on their next turn.\n\nIf heads, their attack misses.',
			},
		})

		this.heal = 40
	}

	register(game) {
		// set flag on Pearl's attack
		game.hooks.attack.tap(this.id, (target, turnAction, derivedState) => {
			const {
				attackerHermitCard,
				attackerHermitInfo,
				opponentPlayer,
				typeAction,
				currentPlayer,
			} = derivedState

			if (typeAction !== 'SECONDARY_ATTACK') return target
			if (!target.isActive) return target
			if (attackerHermitCard.cardId !== this.id) return target

			opponentPlayer.custom[this.id] = true

			return target
		})

		// if flag is set, flip a coin on next turn
		game.hooks.turnStart.tap(this.id, (derivedState) => {
			const {currentPlayer} = derivedState

			if (!currentPlayer.custom[this.id]) return
			delete currentPlayer.custom[this.id]

			const coinFlip = flipCoin(currentPlayer)
			currentPlayer.coinFlips[this.id] = coinFlip
		})

		// if coin flip is heads, damage is zero
		game.hooks.attack.tap(this.id, (target, turnAction, derivedState) => {
			const {currentPlayer} = derivedState

			if (currentPlayer.coinFlips[this.id]?.[0] !== 'heads') return target
			target.multiplier = 0
			return target
		})
	}
}

export default PearlescentMoonRareHermitCard
