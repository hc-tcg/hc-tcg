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
			id: 'tornado',
			name: 'Tornado',
			rarity: 'rare',
			description:
				"Opposing Character goes into the bench following user's attack.\n\nOpponent chooses replacement.\n\nCan only be used if opponent has at least 1 AFK Hermit. Discard after use.",
		})

		this.useReqs = [
			{target: 'opponent', type: 'character', amount: 1, active: true},
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
				opponentCharacterCard,
				opponentActiveRow,
			} = game.ds
			if (singleUseInfo?.id === this.id && target.isActive) {
				const hasOtherCharacters =
					opponentPlayer.board.rows.filter((row) => !!row.characterCard).length > 1
				if (!hasOtherCharacters || !opponentActiveRow) return target
				opponentActiveRow.ailments.push({id: 'knockedout', duration: 1})
				opponentPlayer.board.activeRow = null
				applySingleUse(currentPlayer)
			}
			return target
		})
	}
}

export default TornadoSingleUseCard
