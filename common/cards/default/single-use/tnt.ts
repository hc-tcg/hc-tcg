import {row} from '../../../components/query'
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

	override onAttach(game: GameModel, component: CardComponent) {
		const {player, opponentPlayer} = component

		player.hooks.getAttack.add(component, () => {
			const tntAttack = game
				.newAttack({
					attacker: component.entity,
					target: game.state.rows.findEntity(row.player(opponentPlayer.id), row.active),
					type: 'effect',
					log: (values) =>
						`${values.defaultLog} to attack ${values.target} for ${values.damage} damage `,
				})
				.addDamage(component.entity, 60)

			const backlashAttack = game
				.newAttack({
					attacker: component.entity,
					target: game.state.rows.findEntity(row.player(player.id), row.active),
					type: 'effect',
					isBacklash: true,
					log: (values) => `and took ${values.damage} backlash damage`,
				})
				.addDamage(component.entity, 20)

			tntAttack.addNewAttack(backlashAttack)

			return tntAttack
		})

		player.hooks.afterAttack.add(component, (_) => {
			applySingleUse(game)
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = component
		player.hooks.getAttack.remove(component)
		player.hooks.onAttack.remove(component)
	}
}

export default TNTSingleUseCard
