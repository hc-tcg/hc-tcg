import {CardComponent, ObserverComponent} from '../../../components'
import {GameModel} from '../../../models/game-model'
import {applySingleUse} from '../../../utils/board'
import CardOld from '../../base/card'
import {singleUse} from '../../base/defaults'
import {SingleUse} from '../../base/types'

class DiamondSword extends CardOld {
	props: SingleUse = {
		...singleUse,
		id: 'diamond_sword',
		numericId: 14,
		name: 'Diamond Sword',
		expansion: 'default',
		rarity: 'rare',
		tokens: 1,
		description: "Do 40hp damage to your opponent's active Hermit.",
		hasAttack: true,
		attackPreview: (_game) => '$A40$',
	}

	override onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player, opponentPlayer} = component

		observer.subscribe(player.hooks.getAttack, () => {
			const swordAttack = game
				.newAttack({
					attacker: component.entity,
					target: opponentPlayer.activeRowEntity,
					type: 'effect',
					log: (values) =>
						`${values.defaultLog} to attack ${values.target} for ${values.damage} damage`,
				})
				.addDamage(component.entity, 40)

			return swordAttack
		})

		observer.subscribe(player.hooks.onAttack, (attack) => {
			if (!attack.isAttacker(component.entity)) return
			applySingleUse(game)
		})
	}
}

export default DiamondSword
