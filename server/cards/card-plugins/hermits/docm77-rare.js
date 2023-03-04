import HermitCard from './_hermit-card'
import {flipCoin} from '../../../utils'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

class Docm77RareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'docm77_rare',
			name: 'Docm77',
			rarity: 'rare',
			hermitType: 'farm',
			health: 280,
			primary: {
				name: 'Shadow Tech',
				cost: ['any'],
				damage: 40,
				power: null,
			},
			secondary: {
				name: 'World Eater',
				cost: ['farm', 'farm'],
				damage: 80,
				power:
					'Flip a Coin.\n\nIf heads, attack damage doubles.\n\nIf tails, attack damage is halved.',
			},
		})

		this.headsMultiplier = 2
		this.tailsMultiplier = 0.5
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, attackState) => {
			const {currentPlayer} = game.ds
			const {moveRef, typeAction} = attackState

			if (typeAction !== 'SECONDARY_ATTACK') return target
			if (!target.isActive) return target

			if (moveRef.hermitCard.cardId !== this.id) return target
			const coinFlip = flipCoin(currentPlayer)
			currentPlayer.coinFlips[this.id] = coinFlip

			if (coinFlip[0] === 'heads') {
				target.multiplier *= this.headsMultiplier
			} else if (coinFlip[0] === 'tails') {
				target.multiplier *= this.tailsMultiplier
			}

			return target
		})
	}
}

export default Docm77RareHermitCard
