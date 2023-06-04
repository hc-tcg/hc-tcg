import SingleUseCard from './_single-use-card'
import {validPick} from '../../../../server/utils/reqs'
import {flipCoin} from '../../../../server/utils'
import {applySingleUse} from '../../../../server/utils'
import {GameModel} from '../../../../server/models/game-model'

/**
 * @typedef {import('common/types/pick-process').PickRequirmentT} PickRequirmentT
 */

class EggSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'egg',
			name: 'Egg',
			rarity: 'rare',
			description:
				'After your attack, choose one of your opponent AFK Hermits to make active\n\nFlip a coin. If heads, also do 10hp damage to that Hermit.\n\nDiscard after use.',
		})
		this.damage = {afkTarget: 10}
		this.pickOn = 'followup'
		this.pickReqs = /** @satisfies {Array<PickRequirmentT>} */ ([
			{target: 'opponent', type: 'hermit', amount: 1, active: false},
		])
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, attackState) => {
			const {singleUseInfo, currentPlayer} = game.ds
			if (singleUseInfo?.id !== this.id) return target
			if (!target.isActive) return target

			applySingleUse(game)
			currentPlayer.followUp = this.id

			return target
		})

		game.hooks.followUp.tap(this.id, (action, followUpState) => {
			const {currentPlayer, opponentPlayer} = game.ds
			const {followUp, pickedCardsInfo} = followUpState

			if (followUp !== this.id) return

			const eggPickedCards = pickedCardsInfo[this.id] || []
			if (eggPickedCards.length !== 1) return 'INVALID'

			const pickedHermit = eggPickedCards[0]
			if (!validPick(game.state, this.pickReqs[0], pickedHermit))
				return 'INVALID'
			if (!pickedHermit.row.health) return 'INVALID'

			currentPlayer.coinFlips[this.id] = flipCoin(currentPlayer)
			if (currentPlayer.coinFlips[this.id][0] === 'heads') {
				pickedHermit.row.health -= this.damage.afkTarget
			}

			opponentPlayer.board.activeRow = pickedHermit.rowIndex
			return 'DONE'
		})

		game.hooks.turnEnd.tap(this.id, () => {
			// clean up
			const {currentPlayer} = game.ds
			if (currentPlayer.followUp === this.id) {
				currentPlayer.followUp = null
			}
		})
	}
}

export default EggSingleUseCard
