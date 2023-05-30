import SingleUseCard from './_single-use-card'
import {validPick} from '../../../../server/utils/reqs'
import {flipCoin, applySingleUse} from '../../../../server/utils'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 * @typedef {import('common/types/pick-process').PickRequirmentT} PickRequirmentT
 */

class AnvilSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'anvil',
			name: 'Anvil',
			rarity: 'rare',
			description:
				'Does +30hp damage to any opposing AFK Hermit or flip a coin and If heads, does 80hp damage to to opposing active hermit If tails, does no damage.\n\nDiscard after use.',
		})
		this.damage = {target: 80, afkTarget: 30}
		this.pickOn = 'attack'
		this.useReqs = /** @satisfies {Array<PickRequirmentT>} */ ([
			{target: 'opponent', type: 'hermit', amount: 1},
		])
		this.pickReqs = this.useReqs
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, attackState) => {
			const {singleUseInfo, currentPlayer} = game.ds
			const {pickedCardsInfo} = attackState
			if (singleUseInfo?.id !== this.id) return target

			const crossbowPickedCards = pickedCardsInfo[this.id] || []
			if (crossbowPickedCards.length !== 1) return target
			const pickedHermit = crossbowPickedCards[0]
			if (!validPick(game.state, this.pickReqs[0], pickedHermit)) return target
			if (pickedHermit.row !== target.row) return target

			if (target.isActive) {
				currentPlayer.coinFlips[this.id] = flipCoin(currentPlayer)
				if (currentPlayer.coinFlips[this.id][0] === 'heads') {
					target.extraEffectDamage += this.damage.target
				} else {
					applySingleUse(currentPlayer)
				}
				return target
			}

			target.extraEffectDamage += this.damage.afkTarget
			return target
		})
	}
}

export default AnvilSingleUseCard
