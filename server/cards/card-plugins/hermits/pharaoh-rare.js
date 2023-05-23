import HermitCard from './_hermit-card'
import {flipCoin} from '../../../utils'
import {validPick} from '../../../utils/reqs'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 * @typedef {import('common/types/pick-process').PickRequirmentT} PickRequirmentT
 */

class PharaohRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'pharaoh_rare',
			name: 'Pharaoh',
			rarity: 'rare',
			hermitType: 'balanced',
			health: 300,
			primary: {
				name: 'Targét',
				cost: ['balanced'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Xibalba',
				cost: ['balanced', 'balanced'],
				damage: 80,
				power:
					"Flip a coin after attack. If heads, can give up to +80 health to AFK Hermit. Health given is equal to damage done during attack. Can't heal other Pharaohs. ",
			},
			palette: 'pharaoh',
		})
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

			const coinFlip = flipCoin(currentPlayer)
			currentPlayer.coinFlips[this.id] = coinFlip
			if (coinFlip[0] === 'tails') return target

			const activeRow = currentPlayer.board.activeRow
			const anyAfkHermits = currentPlayer.board.rows.some(
				(row, index) =>
					row.hermitCard &&
					index !== activeRow &&
					row.hermitCard.cardId !== 'pharaoh_rare'
			)

			if (anyAfkHermits) currentPlayer.followUp = this.id

			return target
		})

		game.hooks.attackResult.tap(this.id, (target, turnAction, attackState) => {
			const {currentPlayer} = game.ds

			// Set the number of health to heal by
			currentPlayer.custom[this.id] = Math.min(target.finalDamage, 80)

			return target
		})

		game.hooks.followUp.tap(this.id, (turnAction, followUpState) => {
			const {currentPlayer} = game.ds
			const {pickedCardsInfo} = followUpState

			if (followUpState.followUp !== this.id) return

			const pharaohPickedCards = pickedCardsInfo[this.id] || []
			if (
				pharaohPickedCards[pharaohPickedCards.length - 1].cardInfo?.id ==
				'pharaoh_rare'
			)
				return 'DONE'
			const healTarget = pharaohPickedCards[pharaohPickedCards.length - 1]

			if (!validPick(game.state, this.pickReqs[0], healTarget)) return 'INVALID'

			healTarget.row.health = Math.min(
				healTarget.row.health + currentPlayer.custom[this.id],
				healTarget.cardInfo.health // max health
			)
			delete currentPlayer.custom[this.id]

			return 'DONE'
		})
	}
}

export default PharaohRareHermitCard
