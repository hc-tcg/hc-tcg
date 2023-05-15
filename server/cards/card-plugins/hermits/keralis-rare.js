import HermitCard from './_hermit-card'
import {flipCoin} from '../../../utils'
import {validPick} from '../../../utils/reqs'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 * @typedef {import('common/types/pick-process').PickRequirmentT} PickRequirmentT
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
		this.pickReqs = /** @satisfies {Array<PickRequirmentT>} */ ([
			{target: 'player', type: 'hermit', amount: 1, active: false},
		])
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

			if (!validPick(game.state, this.pickReqs[0], healTarget)) return 'INVALID'

			healTarget.row.health = Math.min(
				healTarget.row.health + this.heal,
				healTarget.cardInfo.health // max health
			)

			return 'DONE'
		})

		// Disable Time Skip attack consecutively
		game.hooks.availableActions.tap(this.id, (availableActions) => {
			const {currentPlayer, playerHermitCard} = game.ds

			if (!playerHermitCard || playerHermitCard.cardId !== this.id)
				return availableActions

			const lastTurnUsed = currentPlayer.custom[playerHermitCard.cardInstance]
			const notReady = lastTurnUsed && game.state.turn <= lastTurnUsed + 2

			// we want to make changes only if time skip was used by the hermit
			return notReady
				? availableActions.filter((a) => a !== 'SECONDARY_ATTACK')
				: availableActions
		})
	}
}

export default KeralisRareHermitCard
