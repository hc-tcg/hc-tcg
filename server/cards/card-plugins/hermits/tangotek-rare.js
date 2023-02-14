import HermitCard from './_hermit-card'
import {flipCoin} from '../../../utils'
import CARDS from '../../../cards'

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
		this.reqsOn = 'followup'
		this.reqs = [{target: 'player', type: 'hermit', amount: 1, active: false}]
	}

	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, derivedState) => {
			const {
				attackerHermitCard,
				typeAction,
				currentPlayer,
				opponentPlayer,
				playerActiveRow,
			} = derivedState

			if (typeAction !== 'SECONDARY_ATTACK') return target
			if (!target.isActive) return target
			if (attackerHermitCard.cardId !== this.id) return target

			const opponentHasOtherHermits =
				opponentPlayer.board.rows.filter((row) => !!row.hermitCard).length > 1
			if (opponentHasOtherHermits) {
				currentPlayer.custom[this.id] = opponentPlayer.board.activeRow
				opponentPlayer.board.activeRow = null
				opponentPlayer.followUp = this.id
			}

			const playerHasOtherHermits =
				currentPlayer.board.rows.filter((row) => !!row.hermitCard).length > 1
			if (playerHasOtherHermits) {
				playerActiveRow.ailments.push({id: 'knockedout', duration: 1})
				currentPlayer.board.activeRow = null
			}

			return target
		})

		game.hooks.followUp.tap(this.id, (turnAction, derivedState) => {
			const {currentPlayer, opponentPlayer, pickedCardsInfo} = derivedState

			if (opponentPlayer.followUp !== this.id) return

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
	}
}

export default TangoTekRareHermitCard
