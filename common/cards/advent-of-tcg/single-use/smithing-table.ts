import {SlotComponent, StatusEffectComponent} from '../../../components'
import query from '../../../components/query'
import SmithingTableEffect from '../../../status-effects/smithing-table'
import {applySingleUse} from '../../../utils/board'
import {singleUse} from '../../defaults'
import {SingleUse} from '../../types'

const pickCondition = query.every(
	query.slot.currentPlayer,
	query.slot.hand,
	(_game, slot) => {
		const card = slot.card
		if (!card) return false
		return card.isAttach() && !card.getStatusEffect(SmithingTableEffect)
	},
)

const SmithingTable: SingleUse = {
	...singleUse,
	id: 'smithing_table',
	numericId: 248,
	name: 'Smithing Table',
	expansion: 'advent_of_tcg_ii',
	rarity: 'common',
	tokens: 1,
	description:
		'Choose an Attach card from your hand. That card cannot be removed from its slot by either player after being played.\nThe selected card may still discard itself according to its description.',
	log: (values) => values.defaultLog,
	attachCondition: query.every(
		singleUse.attachCondition,
		query.exists(SlotComponent, pickCondition),
	),
	onAttach(game, component, _observer) {
		const {player} = component

		game.addPickRequest({
			player: player.entity,
			id: component.entity,
			message: 'Pick an Attach effect to reinforce.',
			canPick: pickCondition,
			onResult(pickedSlot) {
				applySingleUse(game, pickedSlot)

				game.components
					.new(StatusEffectComponent, SmithingTableEffect, component.entity)
					.apply(pickedSlot.card?.entity)
			},
		})
	},
}

export default SmithingTable
