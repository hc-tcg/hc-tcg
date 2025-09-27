import TurtleShell from '../cards/attach/turtle-shell'
import {CardComponent, StatusEffectComponent} from '../components'
import query from '../components/query'
import {CardEntity} from '../entities'
import LooseShellEffect from '../status-effects/loose-shell'
import {onTurnEnd} from '../types/priorities'
import {achievement} from './defaults'
import {Achievement} from './types'

const TurtleMaster: Achievement = {
	...achievement,
	numericId: 69,
	id: 'turtle-master',
	progressionMethod: 'sum',
	levels: [
		{
			name: 'Turtle Master',
			description:
				'Activate a turtle shell that formerly had the loose shell status effect',
			steps: 1,
		},
	],
	onGameStart(game, player, component, observer) {
		const looseShells: Set<CardEntity> = new Set()

		observer.subscribe(player.hooks.onAttach, (card) => {
			if (card.props.id !== TurtleShell.id) return
			if (card.player.entity !== player.entity) return

			observer.subscribe(card.hooks.onChangeSlot, () => {
				if (
					game.components.exists(
						StatusEffectComponent,
						query.effect.is(LooseShellEffect),
						query.not(query.effect.targetEntity(null)),
						(_game, value) => value.creatorEntity === card.entity,
					)
				)
					looseShells.add(card.entity)
			})
		})

		observer.subscribe(player.hooks.onDetach, (card) => {
			looseShells.delete(card.entity)
		})

		observer.subscribeWithPriority(
			player.hooks.onTurnEnd,
			onTurnEnd.BOARD_STATE,
			() => {
				const activeTurtleShell = game.components.find(
					CardComponent,
					query.card.player(player.entity),
					query.card.active,
					query.card.is(TurtleShell),
				)
				if (
					!activeTurtleShell ||
					player.getActiveHermit()?.getStatusEffect(LooseShellEffect)
				)
					return

				if (looseShells.has(activeTurtleShell.entity)) {
					component.updateGoalProgress({goal: 0})
					looseShells.delete(activeTurtleShell.entity)
				}
			},
		)
	},
}

export default TurtleMaster
