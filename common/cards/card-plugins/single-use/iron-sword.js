import SingleUseCard from './_single-use-card'
import {GameModel} from '../../../../server/models/game-model'
import {AttackModel} from '../../../../server/models/attack-model'
import {applySingleUse} from '../../../../server/utils'

class IronSwordSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'iron_sword',
			name: 'Iron Sword',
			rarity: 'common',
			description: 'Do an additional 20hp damage.',
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player, otherPlayer} = pos

		player.hooks.getAttacks[instance] = () => {
			const index = player.board.activeRow
			if (index === null) return []
			const row = player.board.rows[index]
			if (!row || !row.hermitCard) return []

			const opponentIndex = otherPlayer.board.activeRow
			if (opponentIndex === null || opponentIndex === undefined) return []
			const opponentRow = otherPlayer.board.rows[opponentIndex]
			if (!opponentRow || !opponentRow.hermitCard) return []

			const swordAttack = new AttackModel({
				id: this.getInstanceKey(instance, 'attack'),
				target: {index: opponentIndex, row: opponentRow},
				type: 'effect',
			}).addDamage(20)

			return [swordAttack]
		}

		player.hooks.onAttack[instance] = (attack) => {
			const attackId = this.getInstanceKey(instance, 'attack')
			if (attack.id !== attackId) return

			// We've executed our attack, apply effect
			applySingleUse(game)
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player} = pos
		delete player.hooks.getAttacks[instance]
		delete player.hooks.onAttack[instance]
	}
}

export default IronSwordSingleUseCard
