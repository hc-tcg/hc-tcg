import SingleUseCard from './_single-use-card'
import {GameModel} from '../../../../server/models/game-model'
import {AttackModel} from '../../../../server/models/attack-model'
import {applySingleUse, getActiveRowPos} from '../../../../server/utils'

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
		const {player, opponentPlayer} = pos

		player.hooks.getAttacks[instance] = () => {
			const activePos = getActiveRowPos(player)
			if (!activePos) return []
			const opponentActivePos = getActiveRowPos(opponentPlayer)
			if (!opponentActivePos) return []

			const swordAttack = new AttackModel({
				id: this.getInstanceKey(instance, 'attack'),
				attacker: activePos,
				target: opponentActivePos,
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
