import query from '../components/query'
import CurseOfBindingEffect from '../status-effects/curse-of-binding'
import {afterAttack} from '../types/priorities'
import {achievement} from './defaults'
import {Achievement} from './types'

const PoePoeEnforcer: Achievement = {
	...achievement,
	numericId: 42,
	id: 'poe-poe-enforcer',
	levels: [
		{
			name: 'Poe Poe Enforcer',
			description:
				"Knock out your opponent's active Hermit while your opponent has the Curse of Binding status effect.",
			steps: 1,
		},
	],
	onGameStart(game, player, component, observer) {
		observer.subscribeWithPriority(
			game.hooks.afterAttack,
			afterAttack.ACHIEVEMENTS,
			(attack) => {
				if (!attack.target) return
				let targetHermit = attack.target?.getHermit()
				if (!targetHermit) return
				if (attack.target.health) return
				if (
					targetHermit.slot.inRow() &&
					targetHermit.slot.row?.entity !==
						player.opponentPlayer.activeRowEntity
				)
					return
				if (
					!query.player.hasStatusEffect(CurseOfBindingEffect)(
						game,
						player.opponentPlayer,
					)
				)
					return
				component.incrementGoalProgress({goal: 0})
			},
		)
	},
}

export default PoePoeEnforcer
