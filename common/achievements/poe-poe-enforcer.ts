import query from '../components/query'
import {CardEntity} from '../entities'
import CurseOfBindingEffect from '../status-effects/curse-of-binding'
import {afterAttack} from '../types/priorities'
import {achievement} from './defaults'
import {Achievement} from './types'

const PoePoeEnforcer: Achievement = {
	...achievement,
	numericId: 44,
	id: 'poe-poe-enforcer',
	levels: [
		{
			name: 'Poe Poe Enforcer',
			description:
				'Knock out a hermit with the Curse of Binding status effect.',
			steps: 1,
		},
	],
	onGameStart(game, player, component, observer) {
		let bindedHermits: Set<CardEntity> = new Set()

		observer.subscribe(player.hooks.onTurnStart, () => {
			for (const hermitEntity in Object.values(bindedHermits)) {
				let hermit = game.components.get(hermitEntity as CardEntity)!

				if (!query.card.hasStatusEffect(CurseOfBindingEffect)(game, hermit)) {
					bindedHermits.delete(hermit.entity)
				}
			}
		})

		observer.subscribeWithPriority(
			game.hooks.afterAttack,
			afterAttack.ACHIEVEMENTS,
			(attack) => {
				if (!attack.target) return
				let targetHermit = attack.target?.getHermit()
				if (!targetHermit) return

				if (
					query.card.hasStatusEffect(CurseOfBindingEffect)(game, targetHermit)
				) {
					bindedHermits.add(targetHermit.entity)
				}

				if (attack.target.health) return

				if (bindedHermits.has(targetHermit.entity)) {
					bindedHermits.delete(targetHermit.entity)
					component.incrementGoalProgress({goal: 0})
				}
			},
		)
	},
}

export default PoePoeEnforcer
