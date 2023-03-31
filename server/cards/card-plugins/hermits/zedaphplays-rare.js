import HermitCard from './_hermit-card'
import {flipCoin} from '../../../utils'
import CARDS from '../../../cards'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

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

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		// On Zed's attack flipCoin and set flag
		game.hooks.attack.tap(this.id, (target, turnAction, attackState) => {
			const {currentPlayer, opponentPlayer} = game.ds
			const {moveRef, typeAction} = attackState

			if (typeAction !== 'PRIMARY_ATTACK') return target
			if (!target.isActive) return target
			if (moveRef.hermitCard.cardId !== this.id) return target

			const coinFlip = flipCoin(currentPlayer)
			currentPlayer.coinFlips[this.id] = coinFlip

			if (coinFlip[0] === 'heads') {
				currentPlayer.custom[currentPlayer.id] = flipCoin(currentPlayer)
			}

			return target
		})

		// When opponent attacks check flag and add second coin flip if set
		game.hooks.attack.tap(this.id, (target) => {
			const {opponentPlayer, currentPlayer} = game.ds

			const coinFlip = opponentPlayer.custom[opponentPlayer.id]
			if (!coinFlip) return target
			delete opponentPlayer.custom[opponentPlayer.id]

			currentPlayer.coinFlips['Opponent ' + this.name] = coinFlip
			if (coinFlip[0] !== 'heads') return target

			target.reverseDamage = true
			return target
		})

		// When Zed has turn again, and opponent didn't attack remove flag
		game.hooks.turnStart.tap(this.id, () => {
			const {currentPlayer} = game.ds
			if (!currentPlayer.custom[currentPlayer.id]) return
			delete currentPlayer.custom[currentPlayer.id]
		})
	}
}

export default ZedaphPlaysRareHermitCard
