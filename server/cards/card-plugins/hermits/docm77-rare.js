import HermitCard from './_hermit-card'
import {flipCoin} from '../../../utils'

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

	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, derivedState) => {
			const {attackerHermitCard, typeAction, currentPlayer} = derivedState

			if (typeAction !== 'SECONDARY_ATTACK') return target

			if (attackerHermitCard.cardId !== this.id) return target
			const coinFlip = flipCoin(currentPlayer)
			currentPlayer.coinFlips[this.id] = coinFlip

			if (coinFlip === 'heads') {
				target.multiplier *= this.headsMultiplier
			} else if (coinFlip === 'tails') {
				target.multiplier *= this.tailsMultiplier
			}

			return target
		})
	}
}

export default Docm77RareHermitCard
