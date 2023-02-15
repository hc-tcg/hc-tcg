import HermitCard from './_hermit-card'
import {flipCoin, discardCard} from '../../../utils'

/*
- Has to support having two different afk targets (one for hypno, one for su effect like bow)
- If the afk target for Hypno's ability & e.g. bow are the same, don't apply weakness twice
- TODO - Can't use Got 'Em to attack AFK hermits even with Efficiency if Hypno has no item cards to discard
*/
class HypnotizdRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'hypnotizd_rare',
			name: 'Hypno',
			rarity: 'rare',
			hermitType: 'miner',
			health: 270,
			primary: {
				name: 'MmHmm',
				cost: ['miner'],
				damage: 60,
				power: null,
			},
			secondary: {
				name: "Got 'Em",
				cost: ['miner', 'any'],
				damage: 70,
				power:
					'Player can choose to have Hypno attack AFK opposing Hermits.\n\nIf AFK Hermit is attacked,\n\nHypno must discard 1 item card.',
			},
		})

		this.pickOn = 'attack'
		this.pickReqs = [
			{target: 'opponent', type: 'hermit', amount: 1},
			{target: 'player', type: 'item', amount: 1, active: true},
		]
	}

	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, derivedState) => {
			const {
				attackerHermitCard,
				attackerHermitInfo,
				typeAction,
				currentPlayer,
				attackerActiveRow,
				pickedCardsInfo,
			} = derivedState

			if (typeAction !== 'SECONDARY_ATTACK') return target
			if (attackerHermitCard.cardId !== this.id) return target
			if (!target.isActive) return target

			const hypnoPickedCards = pickedCardsInfo[this.id] || []
			if (hypnoPickedCards.length !== 2) return target

			// TODO - validations for correct player & rollback attack on invalid?
			const pickedHermit = hypnoPickedCards[0]
			if (pickedHermit.slotType !== 'hermit') return target
			const pickedItem = hypnoPickedCards[1]
			if (pickedItem.slotType !== 'item') return target

			const isActive = target.row === pickedHermit.row
			if (!isActive) {
				target.row = pickedHermit.row
				discardCard(game, pickedItem.card)
			}
			return target
		})
	}
}

export default HypnotizdRareHermitCard
