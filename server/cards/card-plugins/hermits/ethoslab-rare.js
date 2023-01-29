import HermitCard from './_hermit-card'
import {flipCoin, discardCard} from '../../../utils'

class EthosLabRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'ethoslab_rare',
			name: 'Etho',
			rarity: 'rare',
			hermitType: 'farm',
			health: 280,
			primary: {
				name: 'Oh Snappers',
				cost: ['redstone'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Blue Fire',
				cost: ['redstone', 'redstone'],
				damage: 80,
				power:
					'Flip a Coin.\n\nIf heads, this attack also BURNs the opponent. Does an additional +20HP damage per turn until opponent is knocked out.\n\nGoing AFK does not eliminate the BURN.',
			},
		})
	}

	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, derivedState) => {
			const {
				attackerHermitCard,
				typeAction,
				currentPlayer,
				opponentActiveRow,
				opponentEffectCardInfo,
			} = derivedState

			if (typeAction !== 'SECONDARY_ATTACK') return target

			if (attackerHermitCard.cardId !== this.id) return target
			const coinFlip = flipCoin(currentPlayer)
			currentPlayer.coinFlips[this.id] = coinFlip

			if (coinFlip[0] === 'heads') {
				if (target.row.effectCard?.cardId === 'water_bucket') {
					discardCard(game.state, target.row.effectCard)
				} else {
					target.row.ailments.push('fire')
				}
			}

			return target
		})
	}
}

export default EthosLabRareHermitCard
