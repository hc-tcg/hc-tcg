import HermitCard from './_hermit-card'
import {flipCoin} from '../../../utils'

class KeralisRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'keralis_rare',
			name: 'Keralis',
			rarity: 'rare',
			hermitType: 'terraform',
			health: 250,
			primary: {
				name: 'Booshes',
				cost: ['any'],
				damage: 60,
				power: null,
			},
			secondary: {
				name: 'Sweet Face',
				cost: ['terraform', 'terraform', 'any'],
				damage: 0,
				power: 'Heals any AFK Hermit +100HP.\n\nCannot be used consecutively.',
			},
		})
		this.heal = 100
		this.reqsOn = 'attack'
		this.reqs = [{target: 'player', type: 'hermit', amount: 1, active: false}]
	}

	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, derivedState) => {
			const {
				attackerHermitCard,
				typeAction,
				attackerActiveRow,
				pickedCardsInfo,
			} = derivedState

			if (typeAction !== 'SECONDARY_ATTACK') return target
			if (!target.isActive) return target
			if (attackerHermitCard.cardId !== this.id) return target

			const keralisPickedCards = pickedCardsInfo[this.id] || []
			if (keralisPickedCards.length !== 1) return target
			const healTarget = keralisPickedCards[0]
			if (
				!healTarget.cardInfo ||
				healTarget.slotType !== 'hermit' ||
				healTarget.isActive
			)
				return target

			healTarget.row.health = Math.min(
				healTarget.row.health + this.heal,
				healTarget.cardInfo.health // max health
			)

			return target
		})
	}
}

export default KeralisRareHermitCard
