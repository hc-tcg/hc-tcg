import SingleUseCard from './_single-use-card'
import {validPick} from '../../../utils/reqs'
import {flipCoin} from '../../../utils'
import {applySingleUse} from '../../../utils'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 * @typedef {import('common/types/pick-process').PickRequirmentT} PickRequirmentT
 */

class EggSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'egg',
			name: 'Egg',
			rarity: 'rare',
			description:
				'After your attack, choose one of yout opponent AFK Hermits to make active\n\nFlip a coin. If heads also do 10hp damage to that Hermit.\n\nDiscard after use.',
		})
		this.damage = {afkTarget: 10}
		this.pickOn = 'attack'
		this.useReqs = /** @satisfies {Array<PickRequirmentT>} */ ([
			{target: 'opponent', type: 'hermit', amount: 1, active: false},
		])
		this.pickReqs = this.useReqs
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, attackState) => {
			const {singleUseInfo, currentPlayer, opponentPlayer} = game.ds
			const {pickedCardsInfo} = attackState
			if (singleUseInfo?.id !== this.id) return target
			if (target.isActive) return target

			const eggPickedCards = pickedCardsInfo[this.id] || []
			if (eggPickedCards.length !== 1) return target
			const pickedHermit = eggPickedCards[0]
			if (!validPick(game.state, this.pickReqs[0], pickedHermit)) return target
			if (pickedHermit.row !== target.row) return target

			currentPlayer.coinFlips[this.id] = flipCoin(currentPlayer)
			if (currentPlayer.coinFlips[this.id][0] === 'heads') {
				target.extraEffectDamage += this.damage.afkTarget
			} else {
				// Prevent player from removing the card after attacking,
				// not needed if extra damage is applied
				applySingleUse(currentPlayer)
			}

			// Make the picked hermit active
			opponentPlayer.board.activeRow = pickedHermit.rowIndex

			return target
		})
	}
}

export default EggSingleUseCard
