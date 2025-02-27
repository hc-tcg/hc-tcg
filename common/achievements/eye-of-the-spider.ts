import assert from 'assert'
import query from '../components/query'
import {CardEntity} from '../entities'
import PoisonEffect from '../status-effects/poison'
import {afterAttack} from '../types/priorities'
import {achievement} from './defaults'
import {Achievement} from './types'

const EyeOfTheSpider: Achievement = {
	...achievement,
	numericId: 5,
	id: 'eye-of-the-spider',
	levels: [
		{
			name: 'Eye of the Spider',
			description: 'Knock out a poisoned AFK Hermit.',
			steps: 1,
		},
	],
	onGameStart(game, playerEntity, component, observer) {
		const player = game.components.get(playerEntity)
		assert(player)
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
					component.incrementGoalProgress({goal: 0})
				}
			},
		)
	},
}

export default EyeOfTheSpider
