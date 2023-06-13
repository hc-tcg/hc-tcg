import HermitCard from './_hermit-card'
import {discardCard} from '../../../../server/utils'
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
					"You can choose to attack an opponent's AFK Hermit.\n\nIf AFK Hermit is attacked, you must discard 1 attached item card.",
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

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player} = pos
		const instanceKey = this.getInstanceKey(instance)

		player.hooks.beforeAttack[instance] = (attack, pickedSlots) => {
			// Change attack target before the main attack loop
			if (attack.id !== instanceKey || attack.type !== 'secondary') return

			const pickedHermit = pickedSlots[this.id][0]
			const pickedItem = pickedSlots[this.id][1]
			const efficiency = !!player.custom['efficiency']

			// Change attack target
			if (!pickedHermit.row || !pickedHermit.row.state.hermitCard) return
			attack.target = {
				index: pickedHermit.row.index,
				row: pickedHermit.row.state,
			}

			// Discard item card
			const isActive = player.board.activeRow === pickedHermit.row.index
			if (!efficiency && !isActive) {
				discardCard(game, pickedItem.slot.card)
			}
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onDetach(game, instance, pos) {
		delete pos.player.hooks.beforeAttack[instance]
	}
}

export default HypnotizdRareHermitCard
