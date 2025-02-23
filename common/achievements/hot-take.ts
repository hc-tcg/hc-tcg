import {StatusEffectComponent} from '../components'
import query from '../components/query'
import FireEffect from '../status-effects/fire'
import {onTurnEnd} from '../types/priorities'
import {achievement} from './defaults'
import {Achievement} from './types'

const HotTake: Achievement = {
	...achievement,
	numericId: 17,
	id: 'hot_take',
	name: 'Hot Take',
	description: 'Have 3 opponent hermits be on fire simultaneously.',
	steps: 3,
	icon: '',
	onGameStart(game, playerEntity, component, observer) {
		const player = game.components.get(playerEntity)
		if (!player) return

		const checkStatusEffects = () => {
			const statusEffects: Record<string, StatusEffectComponent[]> = {}
			game.components
				.filter(
					StatusEffectComponent,
					query.effect.targetIsCardAnd(
						query.card.player(playerEntity),
						query.card.onBoard,
						query.card.isHermit,
					),
					query.effect.is(FireEffect),
				)
				.forEach((statusEffect) => {
					const target = statusEffect.target.entity
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

export default HotTake
