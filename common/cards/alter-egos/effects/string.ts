import {slot} from '../../../slot'
import Card, {Attach, Item, attach, item} from '../../base/card'

class StringEffectCard extends Card {
	props: Attach & Item = {
		...attach,
		...item,
		id: 'string',
		numericId: 122,
		name: 'String',
		expansion: 'alter_egos',
		type: 'balanced',
		category: 'attach',
		rarity: 'rare',
		tokens: 2,
		description:
			"Attach to one of your opponent's empty item or effect slots.\nYour opponent can no longer attach cards to that slot.",
		attachCondition: slot.every(
			slot.opponent,
			slot.rowHasHermit,
			slot.empty,
			slot.some(slot.attachSlot, slot.itemSlot)
		),
		log: (values) =>
			`$o{${values.opponent}|You}$ attached $eString$ to $p${values.pos.hermitCard}$`,
	}
}

export default StringEffectCard
