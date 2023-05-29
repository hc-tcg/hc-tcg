import HermitCard from './_hermit-card'
import {flipCoin} from '../../../utils'
import CARDS from '../../../cards'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

class StressMonster101RareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'stressmonster101_rare',
			name: 'Stress',
			rarity: 'rare',
			hermitType: 'prankster',
			health: 300,
			primary: {
				name: 'Plonker',
				cost: ['prankster'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Yolo',
				cost: ['prankster', 'prankster', 'prankster'],
				damage: 0,
				power:
					'This attack instantly knocks out opposing Hermit as well as the player.',
			},
		})
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, attackState) => {
			const {playerActiveRow, opponentActiveRow} = game.ds
			const {moveRef, typeAction} = attackState

			if (typeAction !== 'SECONDARY_ATTACK') return target
			if (!target.isActive) return target
			if (moveRef.hermitCard.cardId !== this.id) return target
			if (!playerActiveRow || !opponentActiveRow) return target

			playerActiveRow.health = 0
			opponentActiveRow.health = 0
			return target
		})
	}
}

export default StressMonster101RareHermitCard
