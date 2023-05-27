import SingleUseCard from './_single-use-card'
import {discardCard} from '../../../utils'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

class SplashPotionOfPoisonSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'splash-potion-of-poison',
			name: 'Splash Potion of Poison',
			rarity: 'rare',
			description:
				'POISONS the opposing Hermit.\n\nDoes an additional +20hp damage per turn until opponent is knocked out.\n\nGoing AFK does not eliminate the POISON. Discard after use.',
		})

		this.useReqs = [
			{target: 'opponent', type: 'hermit', amount: 1, active: true},
		]
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.applyEffect.tap(this.id, () => {
			const {singleUseInfo, opponentActiveRow} = game.ds
			if (singleUseInfo?.id === this.id) {
				if (opponentActiveRow === null) return 'INVALID'
				const hasMilkBucket =
					opponentActiveRow.effectCard?.cardId === 'milk_bucket'
				const hasDamageEffect = opponentActiveRow.ailments.some((a) =>
					['fire', 'poison'].includes(a.id)
				)
				if (!hasMilkBucket && !hasDamageEffect) {
					opponentActiveRow.ailments.push({id: 'poison', duration: -1})
				}
				return 'DONE'
			}
		})
	}
}

export default SplashPotionOfPoisonSingleUseCard
