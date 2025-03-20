import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../../components'
import {GameModel} from '../../models/game-model'
import {IgnoreAttachSlotEffect} from '../../status-effects/ignore-attach'
import {beforeAttack} from '../../types/priorities'
import {applySingleUse} from '../../utils/board'
import {singleUse} from '../defaults'
import {SingleUse} from '../types'

const GoldenAxe: SingleUse = {
	...singleUse,
	id: 'golden_axe',
	numericId: 31,
	name: 'Golden Axe',
	expansion: 'default',
	rarity: 'rare',
	tokens: 2,
	description:
		"Do 40hp damage to your opponent's active Hermit.\nAny effect card attached to your opponent's active Hermit is ignored during this turn.",
	hasAttack: true,
	attackPreview: (_game) => '$A40$',
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player, opponentPlayer} = component

		observer.subscribe(player.hooks.getAttack, () => {
			const axeAttack = game
				.newAttack({
					attacker: component.entity,
					player: player.entity,
					target: opponentPlayer.activeRowEntity,
					type: 'effect',
					log: (values) =>
						`${values.defaultLog} to attack ${values.target} for ${values.damage} damage`,
				})
				.addDamage(component.entity, 40)

			game.components
				.new(StatusEffectComponent, IgnoreAttachSlotEffect, component.entity)
				.apply(opponentPlayer.getActiveHermit()?.entity)

			return axeAttack
		})

		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.APPLY_SINGLE_USE_ATTACK,
			(attack) => {
				if (attack.isAttacker(component.entity)) {
					applySingleUse(game)
					observer.unsubscribeFromEverything()
				}
			},
		)
	},
}

export default GoldenAxe
