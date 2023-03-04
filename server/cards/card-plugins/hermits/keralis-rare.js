import HermitCard from './_hermit-card'
import {flipCoin} from '../../../utils'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

class KeralisRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'keralis_rare',
			name: 'Keralis',
			rarity: 'rare',
			hermitType: 'terraform',
			health: 250,
			primary: {
				name: 'Booshes',
				cost: ['any'],
				damage: 60,
				power: null,
			},
			secondary: {
				name: 'Sweet Face',
				cost: ['terraform', 'terraform', 'any'],
				damage: 0,
				power: 'Heals any AFK Hermit +100HP.\n\nCannot be used consecutively.',
			},
		})
		this.heal = 100
		this.pickOn = 'followup'
		this.pickReqs = [
			{target: 'player', type: 'hermit', amount: 1, active: false},
		]
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, attackState) => {
			const {currentPlayer} = game.ds
			const {moveRef, attacker, typeAction} = attackState

			if (typeAction !== 'SECONDARY_ATTACK') return target
			if (!target.isActive) return target
			if (moveRef.hermitCard.cardId !== this.id) return target

			const lastTurnUsed =
				currentPlayer.custom[attacker.hermitCard.cardInstance]
			if (lastTurnUsed && lastTurnUsed + 2 >= game.state.turn) return target
			currentPlayer.custom[attacker.hermitCard.cardInstance] = game.state.turn

			const activeRow = currentPlayer.board.activeRow
			const anyAfkHermits = currentPlayer.board.rows.some(
				(row, index) => row.hermitCard && index !== activeRow
			)
			if (anyAfkHermits) currentPlayer.followUp = this.id

			return target
		})

		game.hooks.followUp.tap(this.id, (turnAction, followUpState) => {
			const {currentPlayer} = game.ds
			const {pickedCardsInfo} = followUpState

			if (followUpState.followUp !== this.id) return

			const keralisPickedCards = pickedCardsInfo[this.id] || []
			if (keralisPickedCards.length !== 1) return 'DONE'
			const healTarget = keralisPickedCards[0]
			if (
				!healTarget.cardInfo ||
				healTarget.slotType !== 'hermit' ||
				healTarget.isActive
			)
				return 'INVALID'

			healTarget.row.health = Math.min(
				healTarget.row.health + this.heal,
				healTarget.cardInfo.health // max health
			)

			return 'DONE'
		})
	}
}

export default KeralisRareHermitCard
