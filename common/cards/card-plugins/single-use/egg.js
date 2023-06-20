import SingleUseCard from './_single-use-card'
import {flipCoin, getNonEmptyRows} from '../../../../server/utils'
import {applySingleUse} from '../../../../server/utils'
import {GameModel} from '../../../../server/models/game-model'
import {AttackModel} from '../../../../server/models/attack-model'

/**
 * @typedef {import('common/types/cards').CardPos} CardPos
 */

class EggSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'egg',
			name: 'Egg',
			rarity: 'rare',
			description:
				'After your attack, choose one of your opponent AFK Hermits to make active.\n\nFlip a coin. If heads, also do 10hp damage to that Hermit.',

			pickOn: 'attack',
			pickReqs: [
				{target: 'opponent', type: ['hermit'], amount: 1, active: false},
			],
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player, otherPlayer} = pos

		player.hooks.onAttack[instance] = (attack, pickedSlots) => {
			const pickedSlot = pickedSlots[this.id]
			if (pickedSlot.length !== 1) return
			const pickedHermit = pickedSlot[0]
			if (!pickedHermit.row || !pickedHermit.row.state.hermitCard) return
			const activeRow = player.board.activeRow
			if (activeRow === null) return
			const row = player.board.rows[activeRow]
			if (!row || !row.hermitCard) return

			const coinFlip = flipCoin(player, this.id)
			player.coinFlips[this.id] = coinFlip
			if (coinFlip[0] === 'heads') {
				const eggAttack = new AttackModel({
					id: this.getInstanceKey(instance),
					target: {
						index: pickedHermit.row.index,
						row: pickedHermit.row.state,
						playerId: otherPlayer.id,
					},
					attacker: {
						index: activeRow,
						row: row,
						playerId: player.id,
					},
					type: 'effect',
				}).addDamage(10)

				attack.addNewAttack(eggAttack)
			}

			player.custom[this.getInstanceKey(instance)] = pickedHermit.row.index

			// Only do this once if there are multiple attacks
			delete player.hooks.onAttack[instance]
		}

		player.hooks.afterAttack[instance] = (attackResult) => {
			const eggIndex = player.custom[this.getInstanceKey(instance)]
			otherPlayer.board.activeRow = eggIndex
			applySingleUse(game)
		}
	}

	onDetach(game, instance, pos) {
		const {player} = pos
		delete player.hooks.onAttack[instance]
		delete player.hooks.afterAttack[instance]
		delete player.hooks.onFollowUp[instance]
		delete player.custom[this.getInstanceKey(instance)]
	}

	/**
	 * @param {GameModel} game
	 * @param {CardPos} pos
	 */
	canAttach(game, pos) {
		if (super.canAttach(game, pos) === 'INVALID') return 'INVALID'
		const {otherPlayer} = pos

		const inactiveHermits = getNonEmptyRows(otherPlayer, false)
		if (inactiveHermits.length === 0) return 'NO'

		return 'YES'
	}

	getExpansion() {
		return 'alter_egos'
	}
}

export default EggSingleUseCard
