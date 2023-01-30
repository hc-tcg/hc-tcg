import HermitCard from './_hermit-card'
import {flipCoin} from '../../../utils'

// The tricky part about this one are destroyable items (shield, gold_armor) since they
// are available at the moment of attack, but not after
class GrianRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'grian_rare',
			name: 'Grian',
			rarity: 'rare',
			hermitType: 'prankster',
			health: 250,
			primary: {
				name: 'Borrow',
				cost: ['prankster', 'prankster'],
				damage: 50,
				power:
					"Flip a Coin.\n\nIf heads, Grian takes opponent's active effect card.\n\nPlayer can choose to attach card or discard.",
			},
			secondary: {
				name: 'Start a War',
				cost: ['prankster', 'prankster', 'prankster'],
				damage: 100,
				power: null,
			},
		})
	}

	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, derivedState) => {
			const {
				attackerHermitCard,
				attackerHermitInfo,
				typeAction,
				currentPlayer,
				attackerActiveRow,
				opponentActiveRow,
			} = derivedState

			if (typeAction !== 'PRIMARY_ATTACK') return target
			if (!target.isActive) return target

			if (attackerHermitCard.cardId !== this.id) return target
			const coinFlip = flipCoin(currentPlayer)
			currentPlayer.coinFlips[this.id] = coinFlip

			if (coinFlip[0] === 'tails') return target
			if (!opponentActiveRow.effectCard) return target

			const anyEmptyEffectSlots = currentPlayer.board.rows.some(
				(row) => !!row.hermitCard && !row.effectCard
			)

			if (!anyEmptyEffectSlots) {
				// TODO - this doesn't run the discarded hook
				currentPlayer.discarded.push(opponentActiveRow.effectCard)
				opponentActiveRow.effectCard = null
				return target
			}

			currentPlayer.followUp = this.id

			return target
		})

		game.hooks.followUp.tap(this.id, (turnAction, derivedState) => {
			const {
				pickedCardsInfo,
				currentPlayer,
				opponentActiveRow,
				followUp,
				opponentEffectCard,
			} = derivedState

			if (followUp !== this.id) return
			if (!opponentEffectCard) return 'INVALID'
			if (pickedCardsInfo.length !== 1) {
				currentPlayer.discarded.push(opponentActiveRow.effectCard)
				opponentActiveRow.effectCard = null
				return 'DONE'
			}

			const targetSlotInfo = pickedCardsInfo[0]
			if (targetSlotInfo.card !== null) return 'INVALID'
			if (targetSlotInfo.slotType !== 'effect') return 'INVALID'
			if (targetSlotInfo.playerId !== currentPlayer.id) return 'INVALID'
			if (targetSlotInfo.row.hermitCard === null) return 'INVALID'

			// TODO - deal with bed (same as emerald)
			targetSlotInfo.row.effectCard = opponentActiveRow.effectCard
			opponentActiveRow.effectCard = null

			return 'DONE'
		})
	}
}

export default GrianRareHermitCard
