import SingleUseCard from './_single-use-card'
import {validPick} from '../../../../server/utils/reqs'
import {GameModel} from '../../../../server/models/game-model'

/**
 * @typedef {import('common/types/pick-process').PickRequirmentT} PickRequirmentT
 */

class BowSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'bow',
			name: 'Bow',
			rarity: 'common',
			description:
				'Does +40hp damage to any opposing AFK Hermit.\n\nDiscard after use.',
		})
		this.damage = {afkTarget: 40}
		this.pickOn = 'attack'
		this.pickReqs = /** @satisfies {Array<PickRequirmentT>} */ ([
			{target: 'opponent', type: 'hermit', amount: 1, active: false},
		])
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, attackState) => {
			const {singleUseInfo} = game.ds
			const {pickedSlotsInfo} = attackState
			if (singleUseInfo?.id !== this.id) return target
			if (target.isActive) return target

			// only attack selected afk target
			const bowPickedCards = pickedSlotsInfo[this.id] || []
			if (bowPickedCards.length !== 1) return target
			const pickedHermit = bowPickedCards[0]
			if (!validPick(game.state, this.pickReqs[0], pickedHermit)) return target
			if (pickedHermit.row !== target.row) return target

			target.extraEffectDamage += this.damage.afkTarget

			return target
		})
	}
}

export default BowSingleUseCard
