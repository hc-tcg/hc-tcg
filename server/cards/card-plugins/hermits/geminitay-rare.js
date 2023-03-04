import HermitCard from './_hermit-card'
import {flipCoin, discardSingleUse} from '../../../utils'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

// Because of this card we can't rely elsewhere on the suCard to be in state on turnEnd hook
// TODO - this should probably alllow to use two attack single use cards...
// TODO - test with multi step use (looting)
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

		/*
		Discarding single use cards needs to be delay, bceause some cards are not sued until later, e.g. chorus fruit
		*/
		game.hooks.actionEnd.tap(this.id, () => {
			const {currentPlayer} = game.ds
			const usedPower = currentPlayer.custom[this.id]
			const suUsed = currentPlayer.board.singleUseCardUsed
			if (usedPower === 1 && suUsed && !currentPlayer.followUp) {
				discardSingleUse(game, currentPlayer)
				currentPlayer.custom[this.id] = 2
			}
		})

		game.hooks.turnEnd.tap(this.id, () => {
			const {currentPlayer} = game.ds
			delete currentPlayer.custom[this.id]
		})

		game.hooks.availableActions.tap(
			this.id,
			(availableActions, pastTurnActions) => {
				const {currentPlayer} = game.ds
				const usedPower = currentPlayer.custom[this.id]

				if (
					usedPower &&
					availableActions.includes('END_TURN') &&
					!availableActions.includes('PLAY_SINGLE_USE_CARD') &&
					!currentPlayer.board.singleUseCard
				) {
					availableActions.push('PLAY_SINGLE_USE_CARD')
				}
				return availableActions
			}
		)
	}
}

export default GeminiTayRareHermitCard
