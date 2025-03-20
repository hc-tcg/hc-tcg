import query from '../components/query'
import CurseOfBindingEffect from '../status-effects/curse-of-binding'
import {afterApply, afterAttack, onTurnEnd} from '../types/priorities'
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
				"Knock out your opponent's active Hermit the turn after they have had the Curse of Binding status effect.",
			steps: 1,
		},
	],
	onGameStart(game, player, component, observer) {
		let turnsSinceCurseOfBindings = 100

		observer.subscribe(player.hooks.onTurnStart, () => {
			turnsSinceCurseOfBindings += 1
		})

		let deadTargets: Array<any> = []

		observer.subscribeWithPriority(
			game.hooks.afterAttack,
			afterAttack.ACHIEVEMENTS,
			(attack) => {
				if (!attack.target) return
				let targetHermit = attack.target?.getHermit()
				if (!targetHermit) return

				if (
					!attack.target.health &&
					turnsSinceCurseOfBindings == 1 &&
					targetHermit.slot.inRow() &&
					targetHermit.slot.row?.entity ===
					player.opponentPlayer.activeRowEntity &&
						!deadTargets.includes(attack.target)
				) {
					component.incrementGoalProgress({goal: 0})
					deadTargets.push(attack.target)
				}
			},
		)

		observer.subscribeWithPriority(
			player.hooks.onTurnEnd,
			onTurnEnd.BEFORE_STATUS_EFFECT_TIMEOUT,
			() => {
				deadTargets = []
			}
		)

		observer.subscribeWithPriority(
			player.hooks.afterApply,
			afterApply.CHECK_BOARD_STATE,
			() => {
				if (
					query.player.hasStatusEffect(CurseOfBindingEffect)(
						game,
						player.opponentPlayer,
					)
				) {
					turnsSinceCurseOfBindings = 0
				}
			},
		)
	},
}

export default PoePoeEnforcer
