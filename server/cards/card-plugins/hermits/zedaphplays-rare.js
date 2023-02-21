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
					'Flip a Coin.\n\nIf heads, opponent flips a coin their next turn.\n\nIf heads, opponent damages themselves.',
			},
			secondary: {
				name: 'Get Dangled',
				cost: ['explorer', 'explorer'],
				damage: 80,
				power: null,
			},
		})
	}

	register(game) {
		// On Zed's attack flipCoin and set flag
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

			const coinFlip = flipCoin(currentPlayer)
			currentPlayer.coinFlips[this.id] = coinFlip

			if (coinFlip[0] === 'heads') {
				currentPlayer.custom[this.id] = flipCoin(currentPlayer)
			}

			return target
		})

		// When opponent' sttack check flag and add second con flip if set
		game.hooks.attack.tap(this.id, (target, turnAction, derivedState) => {
			const {opponentPlayer, currentPlayer} = derivedState

			const coinFlip = opponentPlayer.custom[this.id]
			if (!coinFlip) return target
			delete opponentPlayer.custom[this.id]

			currentPlayer.coinFlips[this.id] = coinFlip
			if (coinFlip[0] !== 'heads') return target

			target.reverseDamage = true
			return target
		})

		// When Zed has turn again, and opponent didn't attack remove flag
		game.hooks.turnStart.tap(this.id, (derivedState) => {
			const {currentPlayer} = derivedState
			if (!currentPlayer.custom[this.id]) return
			delete currentPlayer.custom[this.id]
		})
	}
}

export default ZedaphPlaysRareHermitCard
