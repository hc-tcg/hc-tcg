import HermitCard from './_hermit-card'
import {flipCoin} from '../../../utils'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

class VintageBeefRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'vintagebeef_rare',
			name: 'Beef',
			rarity: 'rare',
			hermitType: 'builder',
			health: 290,
			primary: {
				name: 'Poik',
				cost: ['any'],
				damage: 40,
				power: null,
			},
			secondary: {
				name: 'Beefy Tunes',
				cost: ['builder', 'builder'],
				damage: 80,
				power:
					"Flip a Coin.\n\nIf heads, this attack also removes all status effects from user's active and AFK Hermits.",
			},
		})
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, attackState) => {
			const {currentPlayer} = game.ds
			const {moveRef, typeAction} = attackState

			if (typeAction !== 'SECONDARY_ATTACK') return target
			if (!target.isActive) return target
			if (moveRef.hermitCard.cardId !== this.id) return target

			const coinFlip = flipCoin(currentPlayer)
			currentPlayer.coinFlips[this.id] = coinFlip

			if (coinFlip[0] === 'tails') return target

			currentPlayer.board.rows.forEach((row) => {
				if (!row.hermitCard) return
				row.ailments = row.ailments.filter(
					(a) => !['fire', 'poison'].includes(a.id)
				)
			})

			return target
		})
	}
}

export default VintageBeefRareHermitCard
