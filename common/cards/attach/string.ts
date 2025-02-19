import query from '../../components/query'
import {attach} from '../defaults'
import {Attach} from '../types'

const String: Attach = {
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
		query.actionAvailable('PLAY_EFFECT_CARD'),
		query.some(query.slot.attach, query.slot.item),
		query.not(query.slot.frozen),
	),
	log: (values) =>
		`$o{${values.opponent}|You}$ attached $e${String.name}$ to $p${values.pos.hermitCard}$`,
}

export default String
