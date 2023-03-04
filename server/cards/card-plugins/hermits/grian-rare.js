import HermitCard from './_hermit-card'
import {flipCoin} from '../../../utils'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

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
			health: 300,
			primary: {
				name: 'Borrow',
				cost: ['prankster', 'prankster'],
				damage: 50,
				power:
					"Flip a Coin.\n\nIf heads, Grian takes opponent's active effect card.\n\nPlayer can choose to attach card or discard.\n\n",
			},
			secondary: {
				name: 'Start a War',
				cost: ['prankster', 'prankster', 'prankster'],
				damage: 100,
				power: null,
			},
		})
		this.pickOn = 'custom'
		this.pickReqs = [{target: 'player', type: 'effect', amount: 1, empty: true}]
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, attackState) => {
			const {currentPlayer} = game.ds
			const {moveRef, typeAction} = attackState

			if (typeAction !== 'PRIMARY_ATTACK') return target
			if (!target.isActive) return target
			if (moveRef.hermitCard.cardId !== this.id) return target

			currentPlayer.custom[this.id] = true

			return target
		})

		game.hooks.actionEnd.tap(this.id, () => {
			const {currentPlayer, opponentActiveRow} = game.ds
			if (!currentPlayer.custom[this.id]) return
			delete currentPlayer.custom[this.id]

			if (!opponentActiveRow?.effectCard) return

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
				return
			}

			// need to store it to prevent the card from being discarded in case of death
			// this will cause the card to disappear from the board until player picks a new slot in followup
			currentPlayer.custom[this.id] = opponentActiveRow.effectCard
			opponentActiveRow.effectCard = null
			currentPlayer.followUp = this.id
		})

		game.hooks.followUp.tap(this.id, (turnAction, followUpState) => {
			const {currentPlayer, playerActiveRow} = game.ds
			const {followUp} = followUpState
			if (followUp !== this.id) return

			const attach = !!turnAction.payload?.attach

			const effectCard = currentPlayer.custom[this.id]
			delete currentPlayer.custom[this.id]
			if (!effectCard || !playerActiveRow) {
				console.log('Missing effect card')
				return 'DONE'
			}

			if (!attach || playerActiveRow.effectCard) {
				currentPlayer.discarded.push(effectCard)
				return 'DONE'
			}

			// TODO - deal with bed (same as emerald)
			playerActiveRow.effectCard = effectCard

			return 'DONE'
		})

		// follow up clenaup in case of timeout
		game.hooks.turnEnd.tap(this.id, () => {
			const {currentPlayer, playerActiveRow} = game.ds
			if (currentPlayer.followUp !== this.id) return
			currentPlayer.followUp = null
			const effectCard = currentPlayer.custom[this.id]
			if (!effectCard) return
			delete currentPlayer.custom[this.id]
			currentPlayer.discarded.push(effectCard)
		})
	}
}

export default GrianRareHermitCard
