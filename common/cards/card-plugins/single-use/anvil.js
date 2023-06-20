import SingleUseCard from './_single-use-card'
import {applySingleUse} from '../../../../server/utils'
import {GameModel} from '../../../../server/models/game-model'
import {AttackModel} from '../../../../server/models/attack-model'

/**
 * @typedef {import('common/types/cards').CardPos} CardPos
 */

class AnvilSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'anvil',
			name: 'Anvil',
			rarity: 'rare',
			description:
				"Do 30hp damage to your opponent's Hermit directly opposite your active Hermit on the board and 10hp damage to each of their Hermits below it.",
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player, opponentPlayer} = pos

		player.hooks.getAttacks[instance] = (pickedSlots) => {
			const activeRow = player.board.activeRow
			if (activeRow === null) return []
			const oppositeRow = opponentPlayer.board.rows[activeRow]
			if (!oppositeRow || !oppositeRow.hermitCard) return []
			const opponentRows = opponentPlayer.board.rows

			const attacks = []
			for (let i = activeRow; i < opponentRows.length; i++) {
				const opponentRow = opponentRows[i]
				if (!opponentRow || !opponentRow.hermitCard) continue
				const attack = new AttackModel({
					id: this.getInstanceKey(
						instance,
						activeRow === i ? 'active' : 'inactive'
					),
					target: {
						player: opponentPlayer,
						rowIndex: i,
						row: opponentRow,
					},
					type: 'effect',
				}).addDamage(i === activeRow ? 30 : 10)

				attacks.push(attack)
			}

			return attacks
		}

		player.hooks.onAttack[instance] = (attack) => {
			const attackId = this.getInstanceKey(instance, 'active')
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

	/**
	 * @param {GameModel} game
	 * @param {CardPos} pos
	 */
	canAttach(game, pos) {
		if (super.canAttach(game, pos) === 'INVALID') return 'INVALID'

		const {opponentPlayer, player} = pos
		const activeRow = player.board.activeRow
		if (activeRow === null) return 'NO'

		const oppositeRow = opponentPlayer.board.rows[activeRow]
		if (!oppositeRow || !oppositeRow.hermitCard) return 'NO'

		return 'YES'
	}

	getExpansion() {
		return 'alter_egos'
	}
}

export default AnvilSingleUseCard
