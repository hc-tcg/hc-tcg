import SingleUseCard from './_single-use-card'
import {GameModel} from '../../../../server/models/game-model'
import {AttackModel} from '../../../../server/models/attack-model'
import {
	applySingleUse,
	getActiveRowPos,
	getNonEmptyRows,
} from '../../../../server/utils'

/**
 * @typedef {import('common/types/cards').CardPos} CardPos
 * @typedef {import('common/types/pick-process').PickedSlots} PickedSlots
 */

class BowSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'bow',
			name: 'Bow',
			rarity: 'common',
			description: 'Do 40hp damage to an AFK Hermit of your choice.',
			pickOn: 'attack',
			pickReqs: [
				{target: 'opponent', slot: ['hermit'], amount: 1, active: false},
			],
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {CardPos} pos
	 */
	canAttach(game, pos) {
		if (super.canAttach(game, pos) === 'INVALID') return 'INVALID'
		const {opponentPlayer} = pos

		// Check if there is an AFK Hermit
		const inactiveRows = getNonEmptyRows(opponentPlayer, false)
		if (inactiveRows.length === 0) return 'NO'

		return 'YES'
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player, opponentPlayer} = pos

		player.hooks.getAttacks[instance] = (pickedSlots) => {
			const activePos = getActiveRowPos(player)
			if (!activePos) return []

			const pickedSlot = pickedSlots[this.id]
			const opponentIndex = pickedSlot[0]?.row?.index
			if (opponentIndex === null || opponentIndex === undefined) return []
			const opponentRow = opponentPlayer.board.rows[opponentIndex]
			if (!opponentRow || !opponentRow.hermitCard) return []

			const bowAttack = new AttackModel({
				id: this.getInstanceKey(instance),
				attacker: activePos,
				target: {
					player: opponentPlayer,
					rowIndex: opponentIndex,
					row: opponentRow,
				},
				type: 'effect',
			}).addDamage(40)

			return [bowAttack]
		}

		player.hooks.onAttack[instance] = (attack) => {
			const attackId = this.getInstanceKey(instance)
			if (attack.id !== attackId) return

			applySingleUse(game)
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player} = pos
		delete player.hooks.getAttacks[instance]
		delete player.hooks.onAttack[instance]
	}
}

export default BowSingleUseCard
