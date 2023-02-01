import HermitCard from './_hermit-card'
import CARDS from '../../../cards'

class Iskall85RareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'iskall85_rare',
			name: 'Iskall85',
			rarity: 'rare',
			hermitType: 'farm',
			health: 290,
			primary: {
				name: 'Of Doom',
				cost: ['farm'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Bird Poop',
				cost: ['farm', 'farm'],
				damage: 80,
				power: 'Does double damage versus Builder types.',
			},
		})
	}

	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, derivedState) => {
			const {attackerHermitCard, typeAction} = derivedState

			if (typeAction !== 'SECONDARY_ATTACK') return target
			if (!target.isActive) return target
			if (attackerHermitCard.cardId !== this.id) return target

			const targetHermitInfo = CARDS[target.row.hermitCard.cardId]
			if (targetHermitInfo.hermitType === 'builder') {
				target.multiplier *= 2
			}

			return target
		})
	}
}

export default Iskall85RareHermitCard
