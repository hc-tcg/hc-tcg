import {CardComponent, ObserverComponent} from '../../components'
import query from '../../components/query'
import {GameModel} from '../../models/game-model'
import {afterAttack, beforeAttack} from '../../types/priorities'
import {attach} from '../defaults'
import {Attach} from '../types'

const Shield: Attach = {
	...attach,
	id: 'shield',
	numericId: 88,
	name: 'Shield',
	expansion: 'default',
	rarity: 'common',
	tokens: 2,
	description:
		'When the Hermit this card is attached to takes damage, that damage is reduced by up to 60hp, and then this card is discarded.',
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component
		let damageBlocked = 0

		// Note that we want to activate on any attack to us, not just from the opponent
		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.EFFECT_REDUCE_DAMAGE,
			(attack) => {
				if (!attack.isTargeting(component) || attack.isType('status-effect'))
					return

				if (damageBlocked < 60) {
					const damageReduction = Math.min(
						attack.calculateDamage(),
						60 - damageBlocked,
					)
					damageBlocked += damageReduction
					attack.addDamageReduction(component.entity, damageReduction)
				}
			},
		)

		observer.subscribeWithPriority(
			game.hooks.afterAttack,
			afterAttack.UPDATE_POST_ATTACK_STATE,
			(attack) => {
				if (damageBlocked > 0 && attack.isTargeting(component)) {
					// attack.isTargeting asserts `attack.target !== null` and `attack.targetEntity !== null`
					component.discard()
					const hermitName = game.components.find(
						CardComponent,
						query.card.slot(query.slot.hermit),
						query.card.row(query.row.entity(attack.targetEntity)),
					)?.props.name
					game.battleLog.addEntry(
						player.entity,
						`$p${hermitName}'s$ $eShield$ on row #${attack.target!.index + 1} was broken`,
					)
				}
			},
		)
	},
}

export default Shield
