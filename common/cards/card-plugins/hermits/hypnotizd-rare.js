import HermitCard from './_hermit-card'
import {discardCard} from '../../../../server/utils'
import {validPick} from '../../../../server/utils/reqs'
import {GameModel} from '../../../../server/models/game-model'

/**
 * @typedef {import('common/types/pick-process').PickRequirmentT} PickRequirmentT
 */

/*
- Has to support having two different afk targets (one for hypno, one for su effect like bow)
- If the afk target for Hypno's ability & e.g. bow are the same, don't apply weakness twice
- TODO - Can't use Got 'Em to attack AFK hermits even with Efficiency if Hypno has no item cards to discard
*/
class HypnotizdRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'hypnotizd_rare',
			name: 'Hypno',
			rarity: 'rare',
			hermitType: 'miner',
			health: 270,
			primary: {
				name: 'MmHmm',
				cost: ['miner'],
				damage: 60,
				power: null,
			},
			secondary: {
				name: "Got 'Em",
				cost: ['miner', 'any'],
				damage: 70,
				power:
					'Player can choose to have Hypno attack AFK opposing Hermits.\n\nIf AFK Hermit is attacked,\n\nHypno must discard 1 item card.',
			},
			pickOn: 'attack',
			pickReqs: [
				{
					target: 'opponent',
					type: ['hermit'],
					amount: 1,
					breakIf: ['active', 'efficiency'],
				},
				{target: 'player', type: ['item'], amount: 1, active: true},
			],
		})
	}

	//@TODO waiting on pickedSlot type refactor

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {currentPlayer} = game.ds
		const instanceKey = this.getInstanceKey(instance)

		currentPlayer.hooks.onAttack[instance] = (attack, pickedSlots) => {
			if (attack.id !== instanceKey || attack.type !== 'secondary') return

			const pickedHermit = pickedSlots[this.id][0]
			const pickedItem = pickedSlots[this.id][1]
			const efficiency = !!currentPlayer.custom['efficiency']

			if (pickedHermit !== target.row) {
				target.applyHermitDamage = false
				return target
			}
			target.applyHermitDamage = true

			if (!efficiency && !target.isActive) discardCard(game, pickedItem.card)
			return target
		}
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, attackState) => {
			const {currentPlayer} = game.ds
			const {moveRef, typeAction, pickedSlotsInfo} = attackState

			if (typeAction !== 'SECONDARY_ATTACK') return target
			if (moveRef.hermitCard.cardId !== this.id) return target

			const hypnoPickedCards = pickedSlotsInfo[this.id] || []

			const pickedHermit = hypnoPickedCards[0]
			if (!validPick(game.state, this.pickReqs[0], pickedHermit)) return target

			const efficiency = !!currentPlayer.custom['efficiency']

			const pickedItem = hypnoPickedCards[1]
			if (!efficiency && !validPick(game.state, this.pickReqs[1], pickedItem))
				return target

			if (pickedHermit.row !== target.row) {
				target.applyHermitDamage = false
				return target
			}
			target.applyHermitDamage = true

			if (!efficiency && !target.isActive) discardCard(game, pickedItem.card)
			return target
		})
	}
}

export default HypnotizdRareHermitCard
