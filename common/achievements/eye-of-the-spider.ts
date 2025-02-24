import assert from 'assert'
import {RowComponent} from '../components'
import query from '../components/query'
import {achievement} from './defaults'
import {Achievement} from './types'
import {afterAttack, beforeAttack} from '../types/priorities'
import PoisonEffect from '../status-effects/poison'
import {CardEntity} from '../entities'

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
	icon: '',
	onGameStart(game, playerEntity, component, observer) {
		const player = game.components.get(playerEntity)
		assert(player)
		const opponentPlayer = player.opponentPlayer

		let poisonedHermits: Set<CardEntity> = new Set()

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
					component.incrementGoalProgress({goal: 0})
				}
			},
		)
	},
}

export default EyeOfTheSpider
