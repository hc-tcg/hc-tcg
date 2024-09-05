import {
	CardComponent,
	ObserverComponent,
	SlotComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import {afterAttack} from '../../../types/priorities'
import {applySingleUse} from '../../../utils/board'
import {singleUse} from '../../base/defaults'
import {SingleUse} from '../../base/types'

const pickCondition = query.every(
	query.slot.opponent,
	query.slot.hermit,
	query.not(query.slot.active),
	query.not(query.slot.empty),
)

const Knockback: SingleUse = {
	...singleUse,
	id: 'knockback',
	numericId: 73,
	name: 'Knockback',
	expansion: 'default',
	rarity: 'rare',
	tokens: 0,
	description:
		'After your attack, your opponent must choose an AFK Hermit to set as their active Hermit, unless they have no AFK Hermits.',
	log: (values) => `${values.defaultLog} with {your|their} attack`,
	attachCondition: query.every(
		singleUse.attachCondition,
		query.exists(SlotComponent, pickCondition),
	),
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player, opponentPlayer} = component

		observer.subscribeWithPriority(
			player.hooks.afterAttack,
			afterAttack.EFFECT_POST_ATTACK_REQUESTS,
			(attack) => {
				if (!attack.isType('primary', 'secondary')) return
				applySingleUse(game)
				// Only Apply this for the first attack
				observer.unsubscribe(player.hooks.afterAttack)

				if (!game.components.exists(SlotComponent, pickCondition)) return

				let activeRow = opponentPlayer.activeRow
				if (activeRow && activeRow.health) {
					let pick = opponentPlayer.createKnockbackPickRequest(component)
					if (pick) game.addPickRequest(pick)
				}
			},
		)
	},
}

export default Knockback
