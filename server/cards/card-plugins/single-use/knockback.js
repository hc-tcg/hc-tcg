import SingleUseCard from './_single-use-card'
import {applySingleUse} from '../../../utils'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

/*
- Don't allow to change to knocked out hermit during next turn
- Chorus fruit/Cubfun probably shouldn't allow that either
*/
class KnockbackSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'knockback',
			name: 'Knockback',
			rarity: 'rare',
			description:
				"Opposing Hermit goes AFK following user's attack.\n\nOpponent chooses replacement.\n\nCan only be used if opponent has at least 1 AFK Hermit. Discard after use.",
		})

		this.useReqs = [
			{target: 'opponent', type: 'hermit', amount: 1, active: true},
		]
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.attack.tap(this.id, (target) => {
			const {
				singleUseInfo,
				currentPlayer,
				opponentPlayer,
				opponentHermitCard,
				opponentActiveRow,
			} = game.ds
			if (singleUseInfo?.id === this.id && target.isActive) {
				const hasOtherHermits =
					opponentPlayer.board.rows.filter((row) => !!row.hermitCard).length > 1
				if (!hasOtherHermits || !opponentActiveRow) return target
				opponentActiveRow.ailments.push({id: 'knockedout', duration: 1})
				opponentPlayer.board.activeRow = null
				applySingleUse(currentPlayer)
			}
			return target
		})
	}
}

export default KnockbackSingleUseCard
