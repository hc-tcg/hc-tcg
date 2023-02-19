import HermitCard from './_hermit-card'
import {flipCoin, discardCard} from '../../../utils'

// - Game should not consume attached totem if deathloop is active
// - Golden Axe should not bypass deathloop (unlike a totem)
// - Needs to work for death by being attack or by death by ailments
// TODO - technically we should remove flag after recovery to avoid it being used twice in one turn, but rn it is difficult to tell if it was used and it should be impossible for scar to die twice (possibly we could ad callback to the recovery object)
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

			// if this card has used the ability don't coin flip
			if (
				currentPlayer.custom[
					this.getUsedIdForCard(attackerHermitCard.cardInstance)
				]
			)
				return target

			const coinFlip = flipCoin(currentPlayer)
			currentPlayer.coinFlips[this.id] = coinFlip
			if (coinFlip[0] === 'tails') return target

			// ability is not used yet, but enable the possibility of it happening
			currentPlayer.custom[this.id] = 1

			return target
		})

		// next turn attack on scar
		game.hooks.attack.tap(this.id, (target, turnAction, derivedState) => {
			const {opponentPlayer, opponentHermitCard} = derivedState

			if (target.row.hermitCard.cardId !== this.id) return target
			if (!opponentPlayer.custom[this.id] !== 2) return target

			// opposing card has now used its ability
			opponentPlayer.custom[
				this.getUsedIdForCard(opponentHermitCard.cardInstance)
			] = true
			target.recovery.push({amount: this.recoverAmount})

			return target
		})

		// ailment death
		game.hooks.hermitDeath.tap(this.id, (recovery, deathInfo) => {
			const {playerState, row} = deathInfo
			if (row.hermitCard.cardId !== this.id) return
			if (playerState.custom[this.id] !== 2) return

			// card has now used its ability
			playerState.custom[
				this.getUsedIdForCard(row.hermitCard.cardInstance)
			] = true
			recovery.push({amount: this.recoverAmount})

			return recovery
		})

		// increment counter to negate power next turn
		game.hooks.turnEnd.tap(this.id, (derivedState) => {
			const {currentPlayer} = derivedState
			if (currentPlayer.custom[this.id] === 1) {
				currentPlayer.custom[this.id] = 2
			} else {
				delete currentPlayer.custom[this.id]
			}
		})

		// power can be used only once. This resets it when the same card is placed on the board again. (e.g. when picked from discarded)
		game.hooks.playCard
			.for('hermit')
			.tap(this.id, (turnAction, derivedState) => {
				const card = turnAction.payload?.card
				if (!card) return
				const {currentPlayer} = derivedState

				const usedCardId = this.getUsedIdForCard(card.cardInstance)
				if (currentPlayer.custom[usedCardId]) {
					delete currentPlayer.custom[usedCardId]
				}
			})
	}

	// returns a unique custom id to register that the ability on this card has been used
	getUsedIdForCard(cardInstance) {
		return this.id + '_used_' + cardInstance
	}
}

export default GoodTimesWithScarRareHermitCard
