import HermitCard from './_hermit-card'
import {flipCoin, discardCard} from '../../../utils'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

// - Game should not consume attached totem if deathloop is active
// - Golden Axe should not bypass deathloop (unlike a totem)
// - Needs to work for death by being attacked or by death by ailments
// TODO - Combination of flip&coin abilities & scar's ability will mean double coin flip for the attack.
// TODO - Scar's coin flip can also occur when he dies from fire/posion at end of a turn
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

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		// scar attacks
		game.hooks.attack.tap(this.id, (target, turnAction, attackState) => {
			const {currentPlayer} = game.ds
			const {moveRef, attacker, typeAction} = attackState

			if (typeAction !== 'SECONDARY_ATTACK') return target
			if (!target.isActive) return target
			if (moveRef.hermitCard.cardId !== this.id) return target
			if (currentPlayer.custom[attacker.hermitCard.cardInstance]) return target

			// Create coin flip beforehand to apply fortune if any
			const coinFlip = flipCoin(currentPlayer)
			currentPlayer.custom[attacker.hermitCard.cardInstance] = coinFlip
			currentPlayer.custom[this.id] = attacker.hermitCard.cardInstance

			return target
		})

		// next turn attack on scar
		game.hooks.attack.tap(this.id, (target) => {
			const {opponentPlayer} = game.ds
			const instance = opponentPlayer.custom[this.id]
			if (!instance) return target

			// Check that we are attacking card that used the Deathloop ability
			if (target.row.hermitCard.cardInstance !== instance) return target

			const coinFlip = opponentPlayer.custom[instance]

			if (!coinFlip || coinFlip[0] === 'tails') return target

			target.recovery.push({amount: this.recoverAmount})
			return target
		})

		// After attack check if scar's ability was used
		game.hooks.attackResult.tap(this.id, (target, turnAction, attackState) => {
			const {currentPlayer, opponentPlayer} = game.ds

			const instance = opponentPlayer.custom[this.id]
			if (!instance) return target
			if (target.row.hermitCard.cardInstance !== instance) return target
			const coinFlip = opponentPlayer.custom[instance]
			if (!coinFlip) return target
			if (!target.died && !target.revived) return target

			currentPlayer.coinFlips[this.id] = coinFlip
			if (!target.revived) delete opponentPlayer.custom[instance]
			delete opponentPlayer.custom[this.id]
		})

		// ailment death
		game.hooks.hermitDeath.tap(this.id, (recovery, deathInfo) => {
			const {playerState, row} = deathInfo
			if (row.hermitCard.cardId !== this.id) return recovery
			const instance = playerState.custom[this.id]
			if (!instance) return recovery
			const coinFlip = playerState.custom[instance]
			if (!coinFlip) return recovery

			playerState.coinFlips[this.id] = coinFlip

			if (coinFlip[0] === 'heads') {
				recovery.push({amount: this.recoverAmount})
			} else {
				delete playerState.custom[instance]
			}
			delete playerState.custom[this.id]

			return recovery
		})

		// If scar did not revive by his next turn delete the flag
		game.hooks.turnStart.tap(this.id, () => {
			const {currentPlayer} = game.ds
			if (currentPlayer.custom[this.id]) {
				const instance = currentPlayer.custom[this.id]
				delete currentPlayer.custom[this.id]
				delete currentPlayer.custom[instance]
			}
		})

		// Power can be used only once. This resets it when the card is placed on board. (e.g. when picked from discarded)
		game.hooks.playCard.for('hermit').tap(this.id, (turnAction) => {
			const card = turnAction.payload?.card
			if (!card || card.cardId !== this.id) return
			const {currentPlayer} = game.ds
			delete currentPlayer.custom[card.cardInstance]
		})
	}
}

export default GoodTimesWithScarRareHermitCard
