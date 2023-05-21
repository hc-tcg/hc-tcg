import HermitCard from './_hermit-card'
import {discardCard, flipCoin} from '../../../utils'
import {validPick} from '../../../utils/reqs'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 * @typedef {import('common/types/pick-process').PickRequirmentT} PickRequirmentT
 */

class JinglerHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'jingler_rare',
			name: 'Jingler',
			rarity: 'rare',
			hermitType: 'speedrunner',
			health: 280,
			primary: {
				name: 'Jingled',
				cost: ['speedrunner'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Deception',
				cost: ['speedrunner', 'speedrunner', 'any'],
				damage: 80,
				power:
					'Flip a coin. If heads, opponent must discard a card from their hand.',
			},
		})
		this.pickOn = 'followup'
		this.pickReqs = /** @satisfies {Array<PickRequirmentT>} */ ([
			{target: 'hand', type: 'any', amount: 1},
		])
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, attackState) => {
			const {currentPlayer, opponentPlayer} = game.ds
			const {moveRef, typeAction} = attackState

			if (typeAction !== 'SECONDARY_ATTACK') return target
			if (!target.isActive) return target
			if (moveRef.hermitCard.cardId !== this.id) return target

			const coinFlip = flipCoin(currentPlayer, 1)
			currentPlayer.coinFlips[this.id] = coinFlip
			if (coinFlip[0] === 'heads') opponentPlayer.followUp = this.id

			return target
		})

		game.hooks.followUp.tap(this.id, (turnAction, followUpState) => {
			const {followUp, pickedCardsInfo} = followUpState
			if (followUp !== this.id) return

			const pickedCards = pickedCardsInfo[this.id]
			if (!validPick(game.state, this.pickReqs[0], pickedCards[0]))
				return 'INVALID'

			discardCard(game, pickedCards[0].card)
			return 'DONE'
		})

		// Pick first card if the time runs out
		game.hooks.followUpTimeout.tap(this.id, () => {
			const {opponentPlayer} = game.ds
			if (opponentPlayer.followUp !== this.id) return

			discardCard(game, opponentPlayer.hand[0])
			opponentPlayer.followUp = null
		})
	}
}

export default JinglerHermitCard
