import {StatusEffectComponent} from '../components'
import query from '../components/query'
import {onTurnEnd} from '../types/priorities'
import {achievement} from './defaults'
import {Achievement} from './types'

const HowDidWeGetHere: Achievement = {
	...achievement,
	numericId: 4,
	id: 'how_did_we_get_here',
	name: 'How Did We Get Here?',
	description: 'Have 5 status effects applied to the same Hermit',
	steps: 5,
	onGameStart(component, observer) {
		const {game, player} = component
		const playerComponent = game.components.get(player)
		if (!playerComponent) return

		const checkStatusEffects = () => {
			const statusEffects: Record<string, StatusEffectComponent[]> = {}
			game.components
				.filter(
					StatusEffectComponent,
					query.effect.targetIsCardAnd(
						query.card.player(player),
						query.card.onBoard,
						query.card.isHermit,
					),
				)
				.forEach((statusEffect) => {
					const target = statusEffect.target.entity
					if (statusEffects[target] === undefined) statusEffects[target] = []
					statusEffects[target].push(statusEffect)
				})
			const bestAttempt = Math.max(
				...Object.values(statusEffects).map((statuses) => statuses.length),
			)
			if (!component.goals[0]) component.goals[0] = 0
			component.goals[0] = Math.max(component.goals[0], bestAttempt)
		}

		observer.subscribe(playerComponent.hooks.beforeApply, checkStatusEffects)
		observer.subscribeWithPriority(
			playerComponent.hooks.onTurnEnd,
			onTurnEnd.BEFORE_STATUS_EFFECT_TIMEOUT,
			checkStatusEffects,
		)
	},
}

export default HowDidWeGetHere
