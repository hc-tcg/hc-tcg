import {row} from '../../../filters'
import {AttackModel} from '../../../models/attack-model'
import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../types/game-state'
import {applySingleUse} from '../../../utils/board'
import Card, {SingleUse, singleUse} from '../../base/card'

class TNTSingleUseCard extends Card {
	props: SingleUse = {
		...singleUse,
		id: 'tnt',
		numericId: 100,
		name: 'TNT',
		expansion: 'default',
		rarity: 'common',
		tokens: 2,
		description:
			"Do 60hp damage to your opponent's active Hermit. Your active Hermit also takes 20hp damage.",
		hasAttack: true,
	}

	override onAttach(game: GameModel, instance: CardComponent) {
		const {player, opponentPlayer} = instance

		player.hooks.getAttack.add(instance, () => {
			const tntAttack = new AttackModel({
				attacker: instance.entity,
				target: game.state.rows.find(row.player(opponentPlayer.id), row.active)?.entity,
				type: 'effect',
				log: (values) =>
					`${values.defaultLog} to attack ${values.target} for ${values.damage} damage `,
			}).addDamage(instance.entity, 60)

			const backlashAttack = new AttackModel({
				attacker: instance.entity,
				target: game.state.rows.find(row.player(player.id), row.active)?.entity,
				type: 'effect',
				isBacklash: true,
				log: (values) => `and took ${values.damage} backlash damage`,
			}).addDamage(instance.entity, 20)

			tntAttack.addNewAttack(backlashAttack)

			return tntAttack
		})

		player.hooks.afterAttack.add(instance, (_) => {
			applySingleUse(game)
		})
	}

	override onDetach(game: GameModel, instance: CardComponent) {
		const {player} = instance
		player.hooks.getAttack.remove(instance)
		player.hooks.onAttack.remove(instance)
	}
}

export default TNTSingleUseCard
