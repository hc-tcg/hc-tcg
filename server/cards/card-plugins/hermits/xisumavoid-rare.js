import HermitCard from './_hermit-card'
import {flipCoin, discardCard} from '../../../utils'

class XisumavoidRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'xisumavoid_rare',
			name: 'Xisuma',
			rarity: 'rare',
			hermitType: 'redstone',
			health: 280,
			primary: {
				name: 'Goodness Me',
				cost: ['redstone'],
				damage: 60,
				power: null,
			},
			secondary: {
				name: 'Cup of Tea',
				cost: ['redstone', 'redstone'],
				damage: 80,
				power:
					'Flip a Coin.\n\nIf heads, this attack also POISONS the opponent. Does an additional +20HP damage per turn until opponent is knocked out.\n\nGoing AFK does not eliminate the POISON.',
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
			const coinFlip = flipCoin(currentPlayer)
			currentPlayer.coinFlips[this.id] = coinFlip

			if (coinFlip[0] === 'heads') {
				if (target.row.effectCard?.cardId !== 'milk_bucket') {
					target.row.ailments.push({id: 'poison', duration: -1})
				}
			}

			return target
		})
	}
}

export default XisumavoidRareHermitCard
