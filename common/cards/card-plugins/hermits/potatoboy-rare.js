import HermitCard from './_hermit-card'
import {flipCoin} from '../../../utils'
import {HERMIT_CARDS} from '../../../cards'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

class PotatoBoyRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'potatoboy-rare',
			name: 'Potato Boy',
			rarity: 'rare',
			hermitType: 'farm',
			health: 270,
			primary: {
				name: 'Peace & Love',
				cost: ['farm'],
				damage: 0,
				power: 'Heals Hermit directly above and below for 40hp',
			},
			secondary: {
				name: 'Volcarbo',
				cost: ['farm', 'farm', 'any'],
				damage: 90,
				power: null,
			},
		})
		this.heal = 40
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, attackState) => {
			const {currentPlayer} = game.ds
			const {moveRef, typeAction} = attackState

			if (typeAction === 'SECONDARY_ATTACK') return target
			if (moveRef.hermitCard.cardId !== this.id) return target

			const activeRow = currentPlayer.board.activeRow || 0
			const rows = currentPlayer.board.rows
			const targetRows = [rows[activeRow - 1], rows[activeRow + 1]].filter(
				Boolean
			)

			targetRows.forEach((row) => {
				if (row.hermitCard) {
					row.health = Math.min(
						row.health + this.heal,
						HERMIT_CARDS[row.hermitCard.cardId].health // max health
					)
				}
			})

			return target
		})
	}
}

export default PotatoBoyRareHermitCard
