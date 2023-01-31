import HermitCard from './_hermit-card'
import {flipCoin, discardCard} from '../../../utils'

// - Game should not consume attached totem if deathloop is active <- NOT WORKING!!!
// - Golden Axe should not bypass deathloop (unlike a totem)
// - Needs to work for death by being attack or by death by ailments
// TODO - technically we should remove flag after recovery toa avoid t being used twice in one turn, but rn it is difficult to tell if it was used and it should be impossible for scar to die twice (possibly we could ad callback to the recovery object)
// TODO - Combination of flip&coin abilities & scar's ability will mean double coin flip for the attack.
class GoodTimesWithScarRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'goodtimeswithscar_rare',
			name: 'Scar',
			rarity: 'rare',
			hermitType: 'builder',
			health: 270,
			primary: {
				name: 'Scarred For Life',
				cost: ['builder'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Deathloop',
				cost: ['builder', 'any'],
				damage: 70,
				power:
					'If Scar is knocked out the following turn, flip a coin.\n\nIf heads, Scar is revived with +50HP.\n\nCan only be revived once.',
			},
		})

		this.recoverAmount = 50
	}

	register(game) {
		// scar attacks
		game.hooks.attack.tap(this.id, (target, turnAction, derivedState) => {
			const {attackerHermitCard, typeAction, currentPlayer} = derivedState

			if (typeAction !== 'SECONDARY_ATTACK') return target
			if (!target.isActive) return target
			if (attackerHermitCard.cardId !== this.id) return target
			if (currentPlayer.custom[attackerHermitCard.cardInstance]) return target

			const coinFlip = flipCoin(currentPlayer)
			currentPlayer.coinFlips[this.id] = coinFlip
			if (coinFlip[0] === 'tails') return target

			currentPlayer.custom[attackerHermitCard.cardInstance] = true
			currentPlayer.custom[this.id] = 1

			return target
		})

		// next turn attack on scar
		game.hooks.attack.tap(this.id, (target, turnAction, derivedState) => {
			const {opponentPlayer} = derivedState
			if (target.row.hermitCard.cardId !== this.id) return target
			if (opponentPlayer.custom[this.id] !== 2) return target
			target.recovery.push({amount: this.recoverAmount})
			return target
		})

		// ailment death
		game.hooks.hermitDeath.tap(this.id, (recovery, deathInfo) => {
			const {playerState, row} = deathInfo
			if (row.hermitCard.cardId !== this.id) return
			if (playerState.custom[this.id] !== 2) return
			recovery.push({amount: this.recoverAmount})
			return recovery
		})

		// increment counter to nebale power next turn
		game.hooks.turnEnd.tap(this.id, (derivedState) => {
			const {currentPlayer} = derivedState
			if (currentPlayer.custom[this.id] === 1) {
				currentPlayer.custom[this.id] = 2
			} else {
				delete currentPlayer.custom[this.id]
			}
		})

		// Power can be used only once. Tis resets it when the card is placed on board. (e.g. when picked from discarded)
		game.hooks.playCard
			.for('hermit')
			.tap(this.id, (turnAction, derivedState) => {
				const card = turnAction.payload?.card
				if (!card) return
				const {currentPlayer} = derivedState
				delete currentPlayer.custom[card.cardInstance]
			})
	}
}

export default GoodTimesWithScarRareHermitCard
