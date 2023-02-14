import SingleUseCard from './_single-use-card'
import {discardCard} from '../../../utils'

class SplashPotionOfPoisonSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'splash_potion_of_poison',
			name: 'Splash Potion of Poison',
			rarity: 'rare',
			description:
				'POISONS the opposing Hermit.\n\nDoes an additional +20hp damage per turn until opponent is knocked out.\n\nGoing AFK does not eliminate the POISON. Discard after use.',
		})
	}
	register(game) {
		game.hooks.applyEffect.tap(this.id, (action, derivedState) => {
			const {singleUseInfo, opponentActiveRow, opponentEffectCardInfo} =
				derivedState
			if (singleUseInfo?.id === this.id) {
				if (opponentActiveRow === null) return 'INVALID'
				if (opponentEffectCardInfo?.id === 'milk_bucket') {
					discardCard(game, opponentActiveRow.effectCard)
				} else {
					opponentActiveRow.ailments.push({id: 'poison', duration: -1})
				}
				return 'DONE'
			}
		})
	}
}

export default SplashPotionOfPoisonSingleUseCard
