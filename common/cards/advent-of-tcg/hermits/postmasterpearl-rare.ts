import {StatusEffectComponent} from '../../../components'
import query from '../../../components/query'
import PostInspectorEffect from '../../../status-effects/post-inspector'
import {hermit} from '../../defaults'
import {Hermit} from '../../types'

const PostmasterPearlRare: Hermit = {
	...hermit,
	id: 'postmasterpearl_rare',
	numericId: 254,
	name: 'Postmaster Pearl',
	shortName: 'Postmaster',
	expansion: 'advent_of_tcg_ii',
	palette: 'advent_of_tcg_ii',
	background: 'advent_of_tcg_ii',
	rarity: 'rare',
	tokens: 1,
	type: 'explorer',
	health: 300,
	primary: {
		name: 'Inspector',
		cost: [],
		damage: 0,
		power:
			'When you draw a card at the end your of the turn, you may shuffle it back into your deck and draw another.',
		passive: true,
	},
	secondary: {
		name: 'Stamp',
		cost: ['explorer', 'explorer'],
		damage: 80,
		power: null,
	},
	onAttach(game, component, _observer) {
		// Prevent mocking passive
		if (component.props !== this) return

		const {player} = component

		const status = game.components.find(
			StatusEffectComponent,
			query.effect.is(PostInspectorEffect),
			query.effect.targetIsPlayerAnd(query.player.entity(player.entity)),
		)
		if (!status) {
			const newEffect = game.components.new(
				StatusEffectComponent,
				PostInspectorEffect,
				component.entity,
			)
			newEffect.apply(player.entity)
			return
		}
		status.counter = (status.counter || 0) + 1
	},
	onDetach(game, component, _observer) {
		if (component.props !== this) return
		const {player} = component

		const status = game.components.find(
			StatusEffectComponent,
			query.effect.is(PostInspectorEffect),
			query.effect.targetIsPlayerAnd(query.player.entity(player.entity)),
		)
		if (!status) return
		if ((status.counter || 0) <= 1) {
			status.remove()
		}
		status.counter = (status.counter || 0) - 1
	},
}

export default PostmasterPearlRare
