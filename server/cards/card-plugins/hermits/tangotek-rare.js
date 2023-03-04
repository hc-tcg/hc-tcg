import HermitCard from './_hermit-card'
import {flipCoin} from '../../../utils'
import CARDS from '../../../cards'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

class TangoTekRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'tangotek_rare',
			name: 'Tango',
			rarity: 'rare',
			hermitType: 'farm',
			health: 290,
			primary: {
				name: 'Skadoodle',
				cost: ['farm'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Extra Flee',
				cost: ['farm', 'farm', 'farm'],
				damage: 100,
				power:
					'At the end of the turn, both Tango and opposing Hermit are replaced by AFK Hermits.\n\nOpponent must select replacement first.\n\nIf there are no AFK Hermits, active Hermit remains in battle.',
			},
		})
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
			const {
				currentPlayer,
				opponentPlayer,
				opponentActiveRow,
				playerActiveRow,
			} = game.ds
			const {moveRef, typeAction} = attackState

			if (typeAction !== 'SECONDARY_ATTACK') return target
			if (!target.isActive) return target
			if (moveRef.hermitCard.cardId !== this.id) return target
			if (!playerActiveRow || !opponentActiveRow) return target

			const opponentHasOtherHermits =
				opponentPlayer.board.rows.filter((row) => !!row.hermitCard).length > 1
			if (opponentHasOtherHermits) {
				currentPlayer.custom[this.id] = opponentPlayer.board.activeRow
				opponentActiveRow.ailments.push({id: 'knockedout', duration: 0})
				opponentPlayer.board.activeRow = null
				opponentPlayer.followUp = this.id
			}

			const playerHasOtherHermits =
				currentPlayer.board.rows.filter((row) => !!row.hermitCard).length > 1
			if (playerHasOtherHermits) {
				playerActiveRow.ailments.push({id: 'knockedout', duration: 0})
				currentPlayer.board.activeRow = null
			}

			return target
		})

		// Remove followup in case all AFK hermits during attack
		game.hooks.actionEnd.tap(this.id, () => {
			const {opponentPlayer} = game.ds
			if (opponentPlayer.followUp !== this.id) return
			const opponentHasOtherHermits =
				opponentPlayer.board.rows.filter(
					(row) => !!row.hermitCard && row.health > 0
				).length > 1
			if (!opponentHasOtherHermits) delete opponentPlayer.followUp
		})

		game.hooks.followUp.tap(this.id, (turnAction, followUpState) => {
			const {currentPlayer, opponentPlayer} = game.ds
			const {followUp, pickedCardsInfo} = followUpState

			if (followUp !== this.id) return

			const pickedCards = pickedCardsInfo[this.id] || []
			if (pickedCards.length !== 1) return 'INVALID'
			if (pickedCards[0].slotType !== 'hermit') return 'INVALID'
			if (pickedCards[0].playerId !== opponentPlayer.id) return 'INVALID'
			if (!pickedCards[0].card) return 'INVALID'
			if (pickedCards[0].rowIndex === currentPlayer.custom[this.id])
				return 'INVALID'
			opponentPlayer.board.activeRow = pickedCards[0].rowIndex
			delete currentPlayer.custom[this.id]

			return 'DONE'
		})

		// follow up clenaup in case of a timeout (autopick first AFK)
		game.hooks.followUpTimeout.tap(this.id, () => {
			const {currentPlayer, opponentPlayer, playerActiveRow} = game.ds
			if (opponentPlayer.followUp !== this.id) return

			opponentPlayer.followUp = null
			delete currentPlayer.custom[this.id]

			const oBoard = opponentPlayer.board
			if (oBoard.activeRow !== null) return

			const hermitIndex = oBoard.rows.findIndex((row) => {
				const hasHermit = !!row.hermitCard
				const canBeActive = row.ailments.every((a) => a.id !== 'knockedout')
				return hasHermit && canBeActive
			})
			if (hermitIndex >= 0) {
				oBoard.activeRow = hermitIndex
				return
			}
			const anyHermitIndex = oBoard.rows.findIndex((row) => !!row.hermitCard)
			if (anyHermitIndex >= 0) oBoard.activeRow = anyHermitIndex
		})
	}
}

export default TangoTekRareHermitCard
