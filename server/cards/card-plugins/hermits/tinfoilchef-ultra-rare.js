import HermitCard from './_hermit-card'
import {flipCoin, discardCard} from '../../../utils'

class TinFoilChefUltraRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'tinfoilchef_ultra_rare',
			name: 'TFC',
			rarity: 'ultra_rare',
			hermitType: 'miner',
			health: 300,
			primary: {
				name: 'Phone Call',
				cost: ['miner', 'miner'],
				damage: 60,
				power: null,
			},
			secondary: {
				name: 'Take It Easy',
				cost: ['miner', 'miner', 'miner'],
				damage: 100,
				power:
					'Flip a Coin.\n\nIf heads, opponent is forced to discard effect card attached to active Hermit.\n\nOnly one effect card per opposing Hermit can be discarded.',
			},
		})
	}

	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, derivedState) => {
			const {attackerHermitCard, typeAction, currentPlayer, opponentActiveRow} =
				derivedState

			if (typeAction !== 'SECONDARY_ATTACK') return target
			if (!target.isActive) return target
			if (attackerHermitCard.cardId !== this.id) return target
			if (!opponentActiveRow.effectCard) return target

			// can't discard two items on the same hermit
			const limit = currentPlayer.custom[this.id] || {}
			if (limit[opponentActiveRow.hermitCard.cardInstance]) return target

			const coinFlip = flipCoin(currentPlayer)
			currentPlayer.coinFlips[this.id] = coinFlip
			if (coinFlip[0] === 'tails') return target

			limit[opponentActiveRow.hermitCard.cardInstance] = true
			currentPlayer.custom[this.id] = limit

			discardCard(game, opponentActiveRow.effectCard)

			return target
		})
	}
}

export default TinFoilChefUltraRareHermitCard
