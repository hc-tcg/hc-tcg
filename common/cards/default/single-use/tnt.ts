import {CardComponent, ObserverComponent} from '../../../components'
import {GameModel} from '../../../models/game-model'
import {applySingleUse} from '../../../utils/board'
import {singleUse} from '../../base/defaults'
import {SingleUse} from '../../base/types'

const TNT: SingleUse = {
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
	attackPreview: (_game) => '$A60$',
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player, opponentPlayer} = component

		observer.subscribe(player.hooks.getAttack, () => {
			applySingleUse(game)

			const tntAttack = game
				.newAttack({
					attacker: component.entity,
					target: opponentPlayer.activeRowEntity,
					type: 'effect',
					log: (values) =>
						`${values.defaultLog} to attack ${values.target} for ${values.damage} damage `,
				})
				.addDamage(component.entity, 60)

			const backlashAttack = game
				.newAttack({
					attacker: component.entity,
					target: player.activeRowEntity,
					type: 'effect',
					isBacklash: true,
					log: (values) => `and took ${values.damage} backlash damage`,
				})
				.addDamage(component.entity, 20)

			tntAttack.addNewAttack(backlashAttack)

			return tntAttack
		})
	},
}

export default TNT
