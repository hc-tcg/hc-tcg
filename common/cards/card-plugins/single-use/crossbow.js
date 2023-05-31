import SingleUseCard from './_single-use-card'
import {validPick} from '../../../../server/utils/reqs'
import {GameModel} from '../../../../server/models/game-model'

/**
 * @typedef {import('common/types/pick-process').PickRequirmentT} PickRequirmentT
 */

class CrossbowSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'crossbow',
			name: 'Crossbow',
			rarity: 'rare',
			description:
				"Does +40hp damage to opposing Hermit and +10hp damage to AFK Hermit of player's choice.\n\nDiscard after use.",
		})
		this.damage = {target: 40, afkTarget: 10}

		this.pickOn = 'attack'
		this.pickReqs = /** @satisfies {Array<PickRequirmentT>} */ ([
			{target: 'opponent', type: 'hermit', amount: 1, active: true},
		])
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, attackState) => {
			const {singleUseInfo} = game.ds
			const {pickedCardsInfo} = attackState
			if (singleUseInfo?.id !== this.id) return target
			if (target.isActive) {
				target.extraEffectDamage += this.damage.target
				return target
			}

			// only attack selected afk target
			const crossbowPickedCards = pickedCardsInfo[this.id] || []
			if (crossbowPickedCards.length !== 1) return target
			const pickedHermit = crossbowPickedCards[0]
			if (!validPick(game.state, this.pickReqs[0], pickedHermit)) return target
			if (pickedHermit.row !== target.row) return target

			target.extraEffectDamage += this.damage.afkTarget
			return target
		})
	}
}

export default CrossbowSingleUseCard
