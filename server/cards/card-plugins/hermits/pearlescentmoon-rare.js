import HermitCard from './_hermit-card'
import {flipCoin} from '../../../utils'
import CARDS from '../../../cards'

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

	register(game) {
		// set flag on Pearl's attack
		game.hooks.attack.tap(this.id, (target, turnAction, derivedState) => {
			const {
				attackerHermitCard,
				attackerHermitInfo,
				typeAction,
				currentPlayer,
			} = derivedState

			if (typeAction !== 'SECONDARY_ATTACK') return target
			if (!target.isActive) return target
			if (attackerHermitCard.cardId !== this.id) return target

			if (!currentPlayer.custom[this.id]) {
				const coinFlip = flipCoin(currentPlayer)
				currentPlayer.custom[this.id] = coinFlip
			}

			return target
		})

		// if coin flip is heads, damage is zero
		game.hooks.attack.tap(this.id, (target, turnAction, derivedState) => {
			const {opponentPlayer, currentPlayer} = derivedState

			const coinFlip = opponentPlayer.custom[this.id]
			if (!coinFlip) return

			currentPlayer.coinFlips[this.id] = coinFlip
			if (coinFlip[0] !== 'heads') {
				delete opponentPlayer.custom[this.id]
				return target
			}
			opponentPlayer.custom[this.id] = 'prevent-consecutive'
			target.multiplier = 0
			return target
		})

		// if flag is set, flip a coin on next turn
		game.hooks.turnEnd.tap(this.id, (derivedState) => {
			const {opponentPlayer} = derivedState

			const coinFlip = opponentPlayer.custom[this.id]
			if (!coinFlip) return
			if (coinFlip[0] !== 'prevent-consecutive') {
				delete opponentPlayer.custom[this.id]
			}
		})

		// if flag is set, flip a coin on next turn
		game.hooks.turnStart.tap(this.id, (derivedState) => {
			const {opponentPlayer} = derivedState

			const state = opponentPlayer.custom[this.id]
			if (!state) return
			if (state === 'prevent-consecutive') {
				delete opponentPlayer.custom[this.id]
			}
		})
	}
}

export default PearlescentMoonRareHermitCard
