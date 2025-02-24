import {PlayerComponent, StatusEffectComponent} from '../components'
import query from '../components/query'
import {onTurnEnd} from '../types/priorities'
import {achievement} from './defaults'
import {Achievement} from './types'

const HowDidWeGetHere: Achievement = {
	...achievement,
	numericId: 4,
	id: 'how_did_we_get_here',
	levels: [
		{
			name: 'How Did We Get Here?',
			description: 'Have 5 status effects applied to the same Hermit.',
			steps: 5,
		},
	],
	icon: '',
	onGameStart(game, playerEntity, component, observer) {
		const player = game.components.get(playerEntity)
		if (!player) return

		const checkStatusEffects = () => {
			const statusEffects: Record<string, StatusEffectComponent[]> = {}
			game.components
				.filter(
					StatusEffectComponent,
					query.some(
						query.effect.targetIsPlayerAnd(
							query.player.entity(playerEntity),
							(_game, player) => player.activeRowEntity !== null,
						),
						query.effect.targetIsCardAnd(
							query.card.player(playerEntity),
							query.card.onBoard,
							query.card.isHealth,
						),
					),
					query.not(query.effect.type('hiddenSystem')),
				)
				.forEach((statusEffect) => {
					const target =
						statusEffect.target instanceof PlayerComponent
							? statusEffect.target.getActiveHermit()!.entity
							: statusEffect.target.entity
					if (statusEffects[target] === undefined) statusEffects[target] = []
					statusEffects[target].push(statusEffect)
				})
			const bestAttempt = Math.max(
				...Object.values(statusEffects).map((statuses) => statuses.length),
			)
			component.bestGoalProgress({goal: 0, progress: bestAttempt})
		}

		observer.subscribe(player.hooks.beforeApply, checkStatusEffects)
		observer.subscribeWithPriority(
			player.hooks.onTurnEnd,
			onTurnEnd.BEFORE_STATUS_EFFECT_TIMEOUT,
			checkStatusEffects,
		)
	},
}

export default HowDidWeGetHere
