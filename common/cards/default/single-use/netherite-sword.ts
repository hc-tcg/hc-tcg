import {CardComponent, ObserverComponent} from '../../../components'
import {GameModel} from '../../../models/game-model'
import {beforeAttack} from '../../../types/priorities'
import {applySingleUse} from '../../../utils/board'
import {singleUse} from '../../base/defaults'
import {SingleUse} from '../../base/types'

const NetheriteSword: SingleUse = {
	...singleUse,
	id: 'netherite_sword',
	numericId: 83,
	name: 'Netherite Sword',
	expansion: 'default',
	rarity: 'ultra_rare',
	tokens: 3,
	description: "Do 60hp damage to your opponent's active Hermit.",
	hasAttack: true,
	attackPreview: (_game) => '$A60$',
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
				.addDamage(component.entity, 60)

			return swordAttack
		})

		observer.subscribeWithPriority(
			player.hooks.beforeAttack,
			beforeAttack.HERMIT_APPLY_ATTACK,
			(attack) => {
				if (!attack.isAttacker(component.entity)) return
				applySingleUse(game)
			},
		)
	},
}

export default NetheriteSword
