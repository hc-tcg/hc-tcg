import {isRemovable} from '../../../../server/utils'
import SingleUseCard from './_single-use-card'
import {GameModel} from '../../../../server/models/game-model'

class EmeraldSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'emerald',
			name: 'Emerald',
			rarity: 'rare',
			description:
				'Swap 1 effect card with opposing active Hermit.\n\nDiscard after use.',
		})
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.applyEffect.tap(this.id, () => {
			const {singleUseInfo, playerActiveRow, opponentActiveRow} = game.ds
			if (singleUseInfo?.id === this.id) {
				if (!playerActiveRow || !opponentActiveRow) return 'INVALID'
				const pEffect = playerActiveRow?.effectCard
				const oEffect = opponentActiveRow?.effectCard
				if (!isRemovable(pEffect) || !isRemovable(oEffect)) return 'DONE'
				playerActiveRow.effectCard = oEffect
				opponentActiveRow.effectCard = pEffect
				return 'DONE'
			}
		})
	}
}

export default EmeraldSingleUseCard
