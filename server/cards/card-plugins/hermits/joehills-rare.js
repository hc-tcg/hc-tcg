import HermitCard from './_hermit-card'
import {flipCoin} from '../../../utils'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

/*
- It was confirmed by Beef that by "consecutively" it is meant not only the power but the attack for 90 itself.
*/
class JoeHillsRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'joehills_rare',
			name: 'Joe',
			rarity: 'rare',
			hermitType: 'farm',
			health: 270,
			primary: {
				name: 'Grow Hills',
				cost: ['farm'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Time Skip',
				cost: ['farm', 'farm', 'any'],
				damage: 90,
				power:
					'Flip a Coin.\n\nIf heads, opponent skips next turn.\n\nCannot be used consecutively if successful.',
			},
		})
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.turnStart.tap(this.id, (turnConfig) => {
			const {opponentPlayer} = game.ds
			if (opponentPlayer.custom[this.id] === 'time-skip') {
				opponentPlayer.custom[this.id] = 'prevent-consecutive'
				turnConfig.skipTurn = true
			} else if (opponentPlayer.custom[this.id]) {
				delete opponentPlayer.custom[this.id]
			}
		})

		game.hooks.attack.tap(this.id, (target, turnAction, attackState) => {
			const {currentPlayer} = game.ds
			const {moveRef, typeAction} = attackState

			if (typeAction !== 'SECONDARY_ATTACK') return target
			if (!target.isActive) return target
			if (moveRef.hermitCard.cardId !== this.id) return target

			// can't be used on first turn
			if (game.state.turn < 2) return target
			// can't be used consecutively
			if (currentPlayer.custom[this.id]) return target

			const coinFlip = flipCoin(currentPlayer)
			currentPlayer.coinFlips[this.id] = coinFlip

			if (coinFlip[0] === 'heads') currentPlayer.custom[this.id] = 'time-skip'

			return target
		})

		// Disable Time Skip attack consecutively
		game.hooks.availableActions.tap(this.id, (availableActions) => {
			const {currentPlayer, playerActiveRow} = game.ds

			// we must have active hermit
			const activeHermit = playerActiveRow?.hermitCard
			if (activeHermit?.cardId !== this.id) return availableActions

			// we want to make changes only if time skip was used by the hermit
			return currentPlayer.custom[this.id]
				? availableActions.filter((a) => a !== 'SECONDARY_ATTACK')
				: availableActions
		})
	}
}

export default JoeHillsRareHermitCard
