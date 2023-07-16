import SingleUseCard from './_single-use-card'
import {GameModel} from '../../../../server/models/game-model'
import {AttackModel} from '../../../../server/models/attack-model'
import {applySingleUse, getActiveRowPos} from '../../../../server/utils'

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
		const {player, opponentPlayer} = pos

		player.hooks.getAttacks.add(instance, () => {
			const activePos = getActiveRowPos(player)
			if (!activePos) return []
			const opponentActivePos = getActiveRowPos(opponentPlayer)
			if (!opponentActivePos) return []

			const tntAttack = new AttackModel({
				id: this.getInstanceKey(instance, 'attack'),
				attacker: activePos,
				target: opponentActivePos,
				type: 'effect',
			}).addDamage(this.id, 60)

			const backlashAttack = new AttackModel({
				id: this.getInstanceKey(instance, 'backlash'),
				attacker: activePos,
				target: activePos,
				type: 'effect',
				isBacklash: true,
			}).addDamage(this.id, 20)

			tntAttack.addNewAttack(backlashAttack)

			return [tntAttack]
		})

		player.hooks.onAttack.add(instance, (attack) => {
			const backlashId = this.getInstanceKey(instance, 'backlash')
			if (attack.id !== backlashId) return

			// We've executed our final attack, apply effect
			applySingleUse(game)
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('types/cards').CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player} = pos
		player.hooks.getAttacks.remove(instance)
		player.hooks.onAttack.remove(instance)
	}
}

export default TNTSingleUseCard
