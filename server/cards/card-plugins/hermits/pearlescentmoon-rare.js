import HermitCard from './_hermit-card'
import {flipCoin} from '../../../utils'
import CARDS from '../../../cards'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

// TODO - Prevent consecutive use
class PearlescentMoonRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'pearlescentmoon_rare',
			name: 'Pearl',
			rarity: 'rare',
			hermitType: 'terraform',
			health: 300,
			primary: {
				name: 'Cleaning Lady',
				cost: ['terraform'],
				damage: 60,
				power: null,
			},
			secondary: {
				name: 'Aussie Ping',
				cost: ['terraform', 'any'],
				damage: 70,
				power:
					'Opponent flips a coin on their next turn.\n\nIf heads, their attack misses.\n\nOpponent can not miss on consecutive turns.',
			},
		})
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		// set flag on Pearl's attack
		game.hooks.attack.tap(this.id, (target, turnAction, attackState) => {
			const {currentPlayer} = game.ds
			const {moveRef, typeAction} = attackState

			if (typeAction !== 'SECONDARY_ATTACK') return target
			if (!target.isActive) return target
			if (moveRef.hermitCard.cardId !== this.id) return target

			if (!currentPlayer.custom[this.getKey('consecutive')]) {
				const coinFlip = flipCoin(currentPlayer)
				currentPlayer.custom[this.getKey('coinFlip')] = coinFlip
			}

			return target
		})

		// if coin flip is heads, damage is zero
		game.hooks.attack.tap(this.id, (target) => {
			const {opponentPlayer, currentPlayer} = game.ds

			const coinFlip = opponentPlayer.custom[this.getKey('coinFlip')]
			if (!coinFlip) return

			currentPlayer.coinFlips[this.id] = coinFlip
			if (coinFlip[0] !== 'heads') {
				delete opponentPlayer.custom[this.getKey('coinFlip')]
				return target
			}
			opponentPlayer.custom[this.getKey('consecutive')] = true
			target.multiplier = 0
			return target
		})

		// clear coinFlip flag at end of opponents turn
		game.hooks.turnEnd.tap(this.id, () => {
			const {opponentPlayer} = game.ds
			delete opponentPlayer.custom[this.getKey('coinFlip')]
		})

		// clear consecutive flag at start of opponents turn
		game.hooks.turnStart.tap(this.id, () => {
			const {opponentPlayer} = game.ds
			delete opponentPlayer.custom[this.getKey('consecutive')]
		})
	}
}

export default PearlescentMoonRareHermitCard
