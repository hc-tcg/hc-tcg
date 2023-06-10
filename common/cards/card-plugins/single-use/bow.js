import SingleUseCard from './_single-use-card'
import {GameModel} from '../../../../server/models/game-model'
import {AttackModel} from '../../../../server/models/attack-model'
import {applySingleUse} from '../../../../server/utils'

/**
 * @typedef {import('common/types/pick-process').PickRequirmentT} PickRequirmentT
 * @typedef {import('common/types/cards').CardPos} CardPos
 * @typedef {import('common/types/pick-process').PickedSlots} PickedSlots
 */

class BowSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'bow',
			name: 'Bow',
			rarity: 'common',
			description:
				'Do 40hp damage to an AFK Hermit of your choice.',
			pickOn: 'attack',
			pickReqs: /** @satisfies {Array<PickRequirmentT>} */ ([
				{target: 'opponent', type: ['hermit'], amount: 1, active: false},
			])
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player, otherPlayer} = pos

		player.hooks.getAttacks[instance] = (pickedSlots) => {
			const index = player.board.activeRow
			if (index === null) return []
			const row = player.board.rows[index]
			if (!row || !row.hermitCard) return []

			const pickedSlot = pickedSlots[this.id]
			const opponentIndex = pickedSlot[0]?.row?.index
			if (!opponentIndex) return []
			const opponentRow = otherPlayer.board.rows[opponentIndex]
			if (!opponentRow || !opponentRow.hermitCard) return []

			const bowAttack = new AttackModel({
				id: this.getInstanceKey(instance),
				attacker: {index, row},
				target: {index: opponentIndex, row: opponentRow},
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
