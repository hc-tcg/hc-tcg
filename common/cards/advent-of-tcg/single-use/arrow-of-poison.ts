import {SlotComponent, StatusEffectComponent} from '../../../components'
import query from '../../../components/query'
import PoisonQuiverEffect from '../../../status-effects/poison-quiver'
import {afterApply} from '../../../types/priorities'
import {singleUse} from '../../defaults'
import {SingleUse} from '../../types'

const ArrowOfPoison: SingleUse = {
	...singleUse,
	id: 'arrow_of_poison',
	name: 'Tipped Arrows of Poison',
	expansion: 'minecraft',
	numericId: 1398,
	rarity: 'rare',
	tokens: 3,
	description:
		"Poison any of your opponent's AFK Hermits that take damage this turn.\nYou can use an another single use effect card this turn.",
	sidebarDescriptions: [
		{
			type: 'statusEffect',
			name: 'poison',
		},
	],
	showConfirmationModal: true,
	log: (values) => values.defaultLog,
	attachCondition: query.every(
		singleUse.attachCondition,
		query.exists(
			SlotComponent,
			query.slot.opponent,
			query.slot.hermit,
			query.not(query.slot.empty),
			query.not(query.slot.active),
		),
	),
	onAttach(game, component, observer) {
		const {player} = component

		observer.subscribe(player.hooks.onApply, () => {
			game.components
				.new(StatusEffectComponent, PoisonQuiverEffect, component.entity)
				.apply(player.entity)
		})

		observer.subscribeWithPriority(
			player.hooks.afterApply,
			afterApply.MODIFY_BLOCKED_ACTIONS,
			() => {
				// Remove playing a single use from completed actions so it can be done again
				game.removeCompletedActions('PLAY_SINGLE_USE_CARD')
				player.singleUseCardUsed = false
			},
		)

		observer.subscribeWithPriority(
			player.hooks.afterApply,
			afterApply.REMOVE_SINGLE_USE,
			() => {
				if (component.slot.onBoard()) component.discard()
			},
		)
	},
}

export default ArrowOfPoison
