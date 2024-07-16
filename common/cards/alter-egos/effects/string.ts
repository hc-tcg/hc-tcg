import {query, row, slot} from '../../../components/query'
import Card from '../../base/card'
import {attach} from '../../base/defaults'
import {Attach} from '../../base/types'

class  extends Card {
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
		attachCondition: query.every(
			slot.opponent,
			slot.empty,
			slot.row(row.hasHermit),
			slot.actionAvailable('PLAY_EFFECT_CARD'),
			query.some(slot.attachSlot, slot.itemSlot),
			query.not(slot.frozen)
		),
		log: (values) =>
			`$o{${values.opponent}|You}$ attached $eString$ to $p${values.pos.hermitCard}$`,
	}
}

export default 
