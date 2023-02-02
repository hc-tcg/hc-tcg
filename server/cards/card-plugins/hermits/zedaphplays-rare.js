import HermitCard from './_hermit-card'
import {flipCoin} from '../../../utils'
import CARDS from '../../../cards'

class ZedaphPlaysRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'zedaphplays_rare',
			name: 'Zedaph',
			rarity: 'rare',
			hermitType: 'explorer',
			health: 290,
			primary: {
				name: 'Sheep Stare',
				cost: ['explorer'],
				damage: 50,
				power:
					'Opponent flips a coin two times their next turn.\n\nIf 2x heads, opponent damages themselves.',
			},
			secondary: {
				name: 'Get Dangled',
				cost: ['explorer', 'explorer'],
				damage: 80,
				power: null,
			},
		})

		this.heal = 40
	}

	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, derivedState) => {
			const {
				attackerHermitCard,
				attackerHermitInfo,
				opponentPlayer,
				typeAction,
				currentPlayer,
			} = derivedState

			if (typeAction !== 'PRIMARY_ATTACK') return target
			if (!target.isActive) return target
			if (attackerHermitCard.cardId !== this.id) return target

			opponentPlayer.custom[this.id] = true
			return target
		})

		game.hooks.turnStart.tap(this.id, (derivedState) => {
			const {currentPlayer} = derivedState

			if (!currentPlayer.custom[this.id]) return
			delete currentPlayer.custom[this.id]

			const coinFlip = flipCoin(currentPlayer, 2)
			currentPlayer.coinFlips[this.id] = coinFlip
		})

		game.hooks.attack.tap(this.id, (target, turnAction, derivedState) => {
			const {currentPlayer, opponentPlayer} = derivedState

			const coinFlip = currentPlayer.coinFlips[this.id]
			if (!coinFlip) return target
			if (coinFlip[0] !== 'heads' || coinFlip[1] !== 'heads') return target

			target.reverseDamage = true
			return target
		})
	}
}

export default ZedaphPlaysRareHermitCard
