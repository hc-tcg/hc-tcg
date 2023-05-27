import HermitCard from './_hermit-card'
import {flipCoin} from '../../../utils'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

class IJevinRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'ijevin_rare',
			name: 'Jevin',
			rarity: 'rare',
			hermitType: 'speedrunner',
			health: 300,
			primary: {
				name: 'Your Boi',
				cost: ['any'],
				damage: 30,
				power: null,
			},
			secondary: {
				name: 'Peace Out',
				cost: ['speedrunner', 'speedrunner', 'any'],
				damage: 90,
				power:
					'After attack, opponent is forced to replace active Hermit with AFK Hermit.\n\nIf there are no AFK Hermits, active Hermit remains in battle.',
			},
		})
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, attackState) => {
			const {opponentPlayer, opponentActiveRow} = game.ds
			const {moveRef, typeAction} = attackState

			if (typeAction !== 'SECONDARY_ATTACK') return target
			if (!target.isActive) return target
			if (moveRef.hermitCard.cardId !== this.id) return target

			const hasOtherHermits =
				opponentPlayer.board.rows.filter((row) => !!row.hermitCard).length > 1
			if (!hasOtherHermits || !opponentActiveRow) return target
			opponentActiveRow.ailments.push({id: 'knockedout', duration: 1})
			opponentPlayer.board.activeRow = null

			return target
		})
	}
}

export default IJevinRareHermitCard
