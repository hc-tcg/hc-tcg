import {slot} from '../../../filters'
import Card, {Attach, attach} from '../../base/card'

class StringEffectCard extends Card {
	props: Attach = {
		...attach,
		id: 'string',
		numericId: 122,
		name: 'String',
		expansion: 'alter_egos',
		category: 'attach',
		rarity: 'rare',
		tokens: 2,
		description:
			"Attach to one of your opponent's empty item or effect slots.\nYour opponent can no longer attach cards to that slot.",
		attachCondition: slot.every(
			slot.opponent,
			slot.rowHasHermit,
			slot.empty,
			slot.actionAvailable('PLAY_EFFECT_CARD'),
			slot.some(slot.attachSlot, slot.itemSlot),
			slot.not(slot.frozen)
		),
		log: (values) =>
			`$o{${values.opponent}|You}$ attached $eString$ to $p${values.pos.hermitCard}$`,
	}
}

export default StringEffectCard
