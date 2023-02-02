import HermitCard from './_hermit-card'
import {flipCoin} from '../../../utils'

class TinFoilChefRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'tinfoilchef_rare',
			name: 'TFC',
			rarity: 'rare',
			hermitType: 'miner',
			health: 300,
			primary: {
				name: 'True Hermit',
				cost: ['any'],
				damage: 40,
				power: null,
			},
			secondary: {
				name: 'Branch Mine',
				cost: ['miner', 'miner'],
				damage: 80,
				power:
					'Flip a Coin.\n\nIf heads, player draws another card at the end of their turn.',
			},
		})
	}

	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, derivedState) => {
			const {attackerHermitCard, typeAction, currentPlayer} = derivedState

			if (typeAction !== 'SECONDARY_ATTACK') return target
			if (!target.isActive) return target
			if (attackerHermitCard.cardId !== this.id) return target

			const coinFlip = flipCoin(currentPlayer)
			currentPlayer.coinFlips[this.id] = coinFlip
			if (coinFlip[0] === 'tails') return target

			const drawCard = currentPlayer.pile.shift()
			if (drawCard) currentPlayer.hand.push(drawCard)

			return target
		})
	}
}

export default TinFoilChefRareHermitCard
