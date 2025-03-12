import query from '../components/query'
import {CardEntity} from '../entities'
import PoisonEffect from '../status-effects/poison'
import {afterAttack} from '../types/priorities'
import {achievement} from './defaults'
import {Achievement} from './types'

const EyeOfTheSpider: Achievement = {
	...achievement,
	numericId: 24,
	id: 'eye-of-the-spider',
	progressionMethod: 'sum',
	levels: [
		{
			name: 'Eye of the Spider',
			description: 'Knock out a poisoned AFK Hermit.',
			steps: 1,
		},
	],
	onGameStart(game, player, component, observer) {
		const opponentPlayer = player.opponentPlayer

		let poisonedHermits: Set<CardEntity> = new Set()

		observer.subscribe(player.hooks.onTurnStart, () => {
			for (const hermitEntity in Object.values(poisonedHermits)) {
				let hermit = game.components.get(hermitEntity as CardEntity)!

				if (!query.card.hasStatusEffect(PoisonEffect)(game, hermit)) {
					poisonedHermits.delete(hermit.entity)
				}
			}
		})

		observer.subscribeWithPriority(
			game.hooks.afterAttack,
			afterAttack.ACHIEVEMENTS,
			(attack) => {
				if (attack.player.entity !== player.entity) return
				if (!attack.target) return
				let targetHermit = attack.target?.getHermit()
				if (!targetHermit) return

				if (query.card.hasStatusEffect(PoisonEffect)(game, targetHermit)) {
					poisonedHermits.add(targetHermit.entity)
				}

				if (attack.target?.entity === opponentPlayer.activeRowEntity) return
				if (attack.target.health) return

				if (poisonedHermits.has(targetHermit.entity)) {
					poisonedHermits.delete(targetHermit.entity)
					component.updateGoalProgress({goal: 0})
				}
			},
		)
	},
}

export default EyeOfTheSpider
