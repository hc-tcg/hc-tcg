import * as query from '../../../components/query'
import Card from '../../base/card'
import {attach} from '../../base/defaults'
import {Attach} from '../../base/types'

class String extends Card {
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
			query.slot.opponent,
			query.slot.empty,
			query.slot.row(query.row.hasHermit),
			query.slot.actionAvailable('PLAY_EFFECT_CARD'),
			query.some(query.slot.attachSlot, query.slot.itemSlot),
			query.not(query.slot.frozen)
		),
		log: (values) =>
			`$o{${values.opponent}|You}$ attached $eString$ to $p${values.pos.hermitCard}$`,
	}
}

export default String
