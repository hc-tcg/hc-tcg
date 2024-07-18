import {GameModel} from '../../../models/game-model'
import * as query from '../../../components/query'
import Card from '../../base/card'
import {
	CardComponent,
	ObserverComponent,
	SlotComponent,
	StatusEffectComponent,
} from '../../../components'
import {SingleUse} from '../../base/types'
import {singleUse} from '../../base/defaults'
import UsedClockEffect from '../../../status-effects/used-clock'
import TurnSkippedEffect from '../../../status-effects/turn-skipped'

class Clock extends Card {
	props: SingleUse = {
		...singleUse,
		id: 'clock',
		numericId: 6,
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
				query.exists(SlotComponent, query.slot.currentPlayer, query.slot.hasStatusEffect(UsedClockEffect))
			),
			(game, _pos) => game.state.turn.turnNumber !== 1
		),
		log: (values) => `${values.defaultLog} and skipped {$o${values.opponent}'s$|your} turn`,
	}

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {opponentPlayer, player} = component
		observer.subscribe(player.hooks.onApply, () => {
			game.components.new(StatusEffectComponent, TurnSkippedEffect).apply(opponentPlayer.entity)
			game.components.new(StatusEffectComponent, UsedClockEffect).apply(player.entity)
		})
	}
}

export default Clock
