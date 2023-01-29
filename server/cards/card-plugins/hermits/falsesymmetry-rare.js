import HermitCard from './_hermit-card'
import {flipCoin, discardCard} from '../../../utils'

class FalseSymmetryRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'falsesymmetry_rare',
			name: 'False',
			rarity: 'rare',
			hermitType: 'builder',
			health: 250,
			primary: {
				name: 'High Noon',
				cost: ['builder'],
				damage: 30,
				power: null,
			},
			secondary: {
				name: 'Supremacy',
				cost: ['builder', 'any'],
				damage: 70,
				power: 'Flip a Coin.\n\nIf heads, False also restores +40HP.',
			},
		})

		this.heal = 40
	}

	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, derivedState) => {
			const {
				attackerHermitCard,
				attackerHermitInfo,
				typeAction,
				currentPlayer,
				attackerActiveRow,
			} = derivedState

			if (typeAction !== 'SECONDARY_ATTACK') return target
			if (!target.isActive) return target

			if (attackerHermitCard.cardId !== this.id) return target
			const coinFlip = flipCoin(currentPlayer)
			currentPlayer.coinFlips[this.id] = coinFlip

			if (coinFlip[0] === 'tails') return target

			attackerActiveRow.health = Math.min(
				attackerActiveRow.health + this.heal,
				attackerHermitInfo.health // max health
			)

			return target
		})
	}
}

export default FalseSymmetryRareHermitCard
