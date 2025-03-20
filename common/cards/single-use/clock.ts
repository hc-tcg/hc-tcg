import {
	CardComponent,
	ObserverComponent,
	PlayerComponent,
	StatusEffectComponent,
} from '../../components'
import query from '../../components/query'
import {GameModel} from '../../models/game-model'
import TurnSkippedEffect from '../../status-effects/turn-skipped'
import UsedClockEffect from '../../status-effects/used-clock'
import {singleUse} from '../defaults'
import {SingleUse} from '../types'

const Clock: SingleUse = {
	...singleUse,
	id: 'clock',
	numericId: 60,
	name: 'Clock',
	expansion: 'default',
	rarity: 'ultra_rare',
	tokens: 4,
	description:
		'Your opponent skips their next turn.\nThis card can not be returned to your hand from your discard pile.',
	showConfirmationModal: true,
	sidebarDescriptions: [
		{
			type: 'glossary',
			name: 'turnSkip',
		},
	],
	attachCondition: query.every(
		singleUse.attachCondition,
		query.not(
			query.exists(
				PlayerComponent,
				query.player.currentPlayer,
				query.player.hasStatusEffect(UsedClockEffect),
			),
		),
		(game, _pos) => game.state.turn.turnNumber !== 1,
	),
	log: (values) =>
		`${values.defaultLog} and skipped {$o${values.opponent}'s$|your} turn`,
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {opponentPlayer, player} = component
		observer.subscribe(player.hooks.onApply, () => {
			game.components
				.new(StatusEffectComponent, TurnSkippedEffect, component.entity)
				.apply(opponentPlayer.entity)
			game.components
				.new(StatusEffectComponent, UsedClockEffect, component.entity)
				.apply(player.entity)
		})
	},
}

export default Clock
