import SingleUseCard from './_single-use-card'
import {discardCard} from '../../../utils'

class LavaBucketSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'lava_bucket',
			name: 'Lava Bucket',
			rarity: 'rare',
			description:
				'BURNS the opposing Hermit\n\nDoes an additional +20hp damage per turn until opponent is knocked out.\n\nGoing AFK does not eliminate the BURN. Discard after use.',
		})
	}
	register(game) {
		game.hooks.applyEffect.tap(this.id, (action, derivedState) => {
			const {singleUseInfo, opponentActiveRow, opponentEffectCardInfo} =
				derivedState
			if (singleUseInfo?.id === this.id) {
				if (opponentActiveRow === null) return 'INVALID'
				if (opponentEffectCardInfo?.id === 'water_bucket') {
					discardCard(game, opponentActiveRow.effectCard)
				} else {
					opponentActiveRow.ailments.push({id: 'fire', duration: -1})
				}
				return 'DONE'
			}
		})
	}
}

export default LavaBucketSingleUseCard
