import SingleUseCard from './_single-use-card'
import {GameModel} from '../../../../server/models/game-model'
import {AttackModel} from '../../../../server/models/attack-model'
import {applySingleUse} from '../../../../server/utils'

class TNTSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'tnt',
			name: 'TNT',
			rarity: 'common',
			description: 'Do an additional 60hp damage. You also take 20hp damage.',
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('types/cards').CardPos} pos
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

			const tntAttack = new AttackModel({
				id: this.getInstanceKey(instance, 'attack'),
				target: {
					index: opponentIndex,
					row: opponentRow,
					playerId: otherPlayer.id,
				},
				attacker: {
					index,
					row,
					playerId: player.id,
				},
				type: 'effect',
			}).addDamage(60)

			const backlashAttack = new AttackModel({
				id: this.getInstanceKey(instance, 'backlash'),
				target: {index, row, playerId: player.id},
				type: 'backlash',
			}).addDamage(20)

			tntAttack.addNewAttack(backlashAttack)

			return [tntAttack]
		}

		player.hooks.onAttack[instance] = (attack) => {
			const backlashId = this.getInstanceKey(instance, 'backlash')
			if (attack.id !== backlashId) return

			// We've executed our final attack, apply effect
			applySingleUse(game)
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('types/cards').CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player} = pos
		delete player.hooks.getAttacks[instance]
		delete player.hooks.onAttack[instance]
	}
}

export default TNTSingleUseCard
