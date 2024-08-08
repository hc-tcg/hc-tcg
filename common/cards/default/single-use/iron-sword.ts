import {CardComponent, ObserverComponent} from '../../../components'
import {GameModel} from '../../../models/game-model'
import {applySingleUse} from '../../../utils/board'
import {singleUse} from '../../base/defaults'
import {SingleUse} from '../../base/types'

const IronSword: SingleUse = {
	...singleUse,
	id: 'iron_sword',
	numericId: 46,
	name: 'Iron Sword',
	expansion: 'default',
	rarity: 'common',
	tokens: 0,
	description: "Do 20hp damage to your opponent's active Hermit.",
	hasAttack: true,
	attackPreview: (_game) => '$A20$',
	onAttach(
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
				.addDamage(component.entity, 20)

			return swordAttack
		})

		observer.subscribe(player.hooks.onAttack, (attack) => {
			if (!attack.isAttacker(component.entity)) return
			applySingleUse(game)
		})
	},
}

export default IronSword
