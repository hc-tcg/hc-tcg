import {SlotComponent, StatusEffectComponent} from '../../../components'
import query from '../../../components/query'
import FrozenEffect from '../../../status-effects/frozen'
import {applySingleUse} from '../../../utils/board'
import {singleUse} from '../../defaults'
import {SingleUse} from '../../types'

const pickCondition = query.every(
	query.slot.hermit,
	query.not(query.slot.active),
	query.not(query.slot.empty),
	query.not(query.slot.hasStatusEffect(FrozenEffect)),
)

const PowderSnowBucket: SingleUse = {
	...singleUse,
	id: 'powder_snow_bucket',
	name: 'Powder Snow Bucket',
	expansion: 'advent_of_tcg_ii',
	numericId: 246,
	rarity: 'rare',
	tokens: 1,
	description: 'Freeze an AFK Hermit.',
	sidebarDescriptions: [
		{
			type: 'statusEffect',
			name: 'frozen',
		},
	],
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
			message: 'Pick an AFK Hermit to Freeze.',
			canPick: pickCondition,
			onResult(pickedSlot) {
				applySingleUse(game, pickedSlot)

				game.components
					.new(StatusEffectComponent, FrozenEffect, component.entity)
					.apply(pickedSlot.card?.entity)
			},
		})
	},
}

export default PowderSnowBucket
