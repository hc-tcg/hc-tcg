import HermitCard from './_hermit-card'
import {flipCoin} from '../../../utils'

class EthosLabUltraRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'ethoslab_ultra_rare',
			name: 'Etho',
			rarity: 'ultra_rare',
			hermitType: 'pvp',
			health: 250,
			primary: {
				name: 'Ladders',
				cost: ['any'],
				damage: 30,
				power: null,
			},
			secondary: {
				name: 'Slab',
				cost: ['any', 'any'],
				damage: 70,
				power:
					'Flip a Coin 3 times.\n\nDoes an additional +20HP damage for every heads.',
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
			if (!target.isActive) return target

			if (attackerHermitCard.cardId !== this.id) return target
			const coinFlip = flipCoin(currentPlayer, 3)
			currentPlayer.coinFlips[this.id] = coinFlip

			const headsAmount = coinFlip.filter((flip) => flip === 'heads').length
			target.damage += headsAmount * 20

			return target
		})
	}
}

export default EthosLabUltraRareHermitCard
