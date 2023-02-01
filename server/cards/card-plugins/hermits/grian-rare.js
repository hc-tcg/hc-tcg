import HermitCard from './_hermit-card'
import {flipCoin} from '../../../utils'

// The tricky part about this one are destroyable items (shield, gold_armor, totem) since they are available at the moment of attack, but not after
/*
// some assumptions that make sense to me:
- gold_armor/shield can't be stolen as they get used up during the attack
- if multiplier is 0 (e.g. invis potion), then shield/golden_armor don't get used and so you can steal them
- totem can be stolen unless it was used to keep opponent hermit alive
- if opponent hermits dies, his effect card can still be stolen
- If Grian dies while attacking (e.g. TNT), then item still get stolen
*/
/*
# Totem
- You can't steal totem during attack since you don't know yet if its gong to be used to revive
- You can't do it at actionEnd since the healthCheck wasn't performed yet
- You can't do it on actionStart since the gamestate was sent already
= You can't do it on actionsAvasilable because it is hard to tell in case of hermit's death it is hard to tell why were his items discarded
- Solution: Going back to using recovery effects during attack, which will enable using the actionEnd hook.
*/

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
			const {attackerHermitCard, typeAction, currentPlayer} = derivedState

			if (typeAction !== 'PRIMARY_ATTACK') return target
			if (!target.isActive) return target

			if (attackerHermitCard.cardId !== this.id) return target
			currentPlayer.custom[this.id] = true

			return target
		})

		game.hooks.actionEnd.tap(this.id, (turnAction, derivedState) => {
			const {currentPlayer, opponentActiveRow} = derivedState
			if (!currentPlayer.custom[this.id]) return
			delete currentPlayer.custom[this.id]

			if (!opponentActiveRow.effectCard) return

			const coinFlip = flipCoin(currentPlayer)
			currentPlayer.coinFlips[this.id] = coinFlip
			if (coinFlip[0] === 'tails') return

			const anyEmptyEffectSlots = currentPlayer.board.rows.some(
				(row) => !!row.hermitCard && !row.effectCard
			)

			if (!anyEmptyEffectSlots) {
				// TODO - this doesn't run the discarded hook
				currentPlayer.discarded.push(opponentActiveRow.effectCard)
				opponentActiveRow.effectCard = null
				return target
			}

			// need to store it to prevent the card from being discarded in case of death
			// this will cause the card to disappear from the board until player picks a new slot in followup
			currentPlayer.custom[this.id] = opponentActiveRow.effectCard
			opponentActiveRow.effectCard = null
			currentPlayer.followUp = this.id
		})

		game.hooks.followUp.tap(this.id, (turnAction, derivedState) => {
			const {pickedCardsInfo, currentPlayer, opponentActiveRow, followUp} =
				derivedState

			const effectCard = currentPlayer.custom[this.id]
			delete currentPlayer.custom[this.id]

			if (followUp !== this.id) return
			if (!effectCard) return 'INVALID'

			const grianPickedCards = pickedCardsInfo[this.id] || []
			if (grianPickedCards.length !== 1) {
				currentPlayer.discarded.push(effectCard)
				return 'DONE'
			}

			const targetSlotInfo = grianPickedCards[0]
			if (targetSlotInfo.card !== null) return 'INVALID'
			if (targetSlotInfo.slotType !== 'effect') return 'INVALID'
			if (targetSlotInfo.playerId !== currentPlayer.id) return 'INVALID'
			if (targetSlotInfo.row.hermitCard === null) return 'INVALID'

			// TODO - deal with bed (same as emerald)
			targetSlotInfo.row.effectCard = effectCard

			return 'DONE'
		})
	}
}

export default GrianRareHermitCard
