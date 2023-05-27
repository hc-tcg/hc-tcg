import HermitCard from './_hermit-card'
import {flipCoin, discardSingleUse} from '../../../utils'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

// Because of this card we can't rely elsewhere on the suCard to be in state on turnEnd hook
class GeminiTayRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'geminitay_rare',
			name: 'Gem',
			rarity: 'rare',
			hermitType: 'terraform',
			health: 270,
			primary: {
				name: "It's Fine",
				cost: ['terraform'],
				damage: 60,
				power: null,
			},
			secondary: {
				name: 'Geminislay',
				cost: ['terraform', 'terraform'],
				damage: 80,
				power:
					'Flip a Coin.\n\nIf heads, Gem can play an additional effect card the same turn.',
			},
		})
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, attackState) => {
			const {currentPlayer} = game.ds
			const {moveRef, typeAction} = attackState

			if (moveRef.hermitCard.cardId !== this.id) return target
			if (typeAction !== 'SECONDARY_ATTACK') return target
			if (!target.isActive) return target

			const coinFlip = flipCoin(currentPlayer)
			currentPlayer.coinFlips[this.id] = coinFlip
			if (coinFlip[0] === 'tails') return target

			// We are using number to make sure extra single_use card use can happen only once
			currentPlayer.custom[this.id] = 1

			return target
		})

		// 1 - Discard single use card after attack so we can use another
		// 2 - Discard single use card after it was applied
		game.hooks.actionEnd.tap(this.id, () => {
			const {currentPlayer} = game.ds
			const usedPower = currentPlayer.custom[this.id]
			const suCard = currentPlayer.board.singleUseCard
			const suUsed = currentPlayer.board.singleUseCardUsed
			if (usedPower === 1 && !currentPlayer.followUp) {
				if (suUsed) {
					discardSingleUse(game, currentPlayer)
				} else if (suCard) {
					currentPlayer.hand.push(suCard)
					currentPlayer.board.singleUseCard = null
				}
				currentPlayer.custom[this.id] = 2
			} else if (usedPower === 2 && suUsed) {
				delete currentPlayer.custom[this.id]
			}
		})

		// Remove flag on single use attack
		game.hooks.attack.tap(this.id, (target, turnAction, attackState) => {
			const {currentPlayer} = game.ds
			const {typeAction} = attackState

			if (currentPlayer.custom[this.id] !== 2) return target
			if (typeAction !== 'ZERO_ATTACK') return target

			// ignore armor/thorns/wolf since they have been already used during main attack
			target.additionalAttack = true
			delete currentPlayer.custom[this.id]
			return target
		})

		// Remove flag when effect card is attached
		game.hooks.playCard.for('effect').tap(this.id, (turnAction) => {
			const {currentPlayer} = game.ds
			delete currentPlayer.custom[this.id]
		})

		// Remove flag at end of turn if it wasn't used
		game.hooks.turnEnd.tap(this.id, () => {
			const {currentPlayer} = game.ds
			delete currentPlayer.custom[this.id]
		})

		game.hooks.availableActions.tap(
			this.id,
			(availableActions, pastTurnActions, lockedActions) => {
				const {currentPlayer} = game.ds
				const usedPower = currentPlayer.custom[this.id] === 2

				// Check for END_TURN prevents adding extra actions during followsup
				if (!usedPower || !availableActions.includes('END_TURN'))
					return availableActions
				if (
					!availableActions.includes('PLAY_SINGLE_USE_CARD') &&
					!lockedActions.includes('PLAY_SINGLE_USE_CARD') &&
					!currentPlayer.board.singleUseCard
				) {
					availableActions.push('PLAY_SINGLE_USE_CARD')
				}

				if (
					!availableActions.includes('ZERO_ATTACK') &&
					!lockedActions.includes('ZERO_ATTACK')
				)
					availableActions.push('ZERO_ATTACK')

				if (
					!availableActions.includes('PLAY_EFFECT_CARD') &&
					!lockedActions.includes('PLAY_EFFECT_CARD')
				)
					availableActions.push('PLAY_EFFECT_CARD')

				return availableActions
			}
		)
	}
}

export default GeminiTayRareHermitCard
