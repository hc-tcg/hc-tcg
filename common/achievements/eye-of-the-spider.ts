import assert from 'assert'
import {RowComponent} from '../components'
import query from '../components/query'
import {achievement} from './defaults'
import {Achievement} from './types'
import {afterAttack, beforeAttack} from '../types/priorities'
import PoisonEffect from '../status-effects/poison'

const EyeOfTheSpider: Achievement = {
	...achievement,
	numericId: 5,
	id: 'eye-of-the-spider',
	levels: [
		{
			name: 'Eye of the Spider',
			description: 'Knockout a poisoned hermit at 10hp.',
			steps: 1,
		},
	],
	icon: '',
	onGameStart(game, playerEntity, component, observer) {
		const player = game.components.get(playerEntity)
		assert(player)

		let target: RowComponent | null = null

		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.REACT_TO_DAMAGE,
			(attack) => {
				target = null

				let targetHermit = attack.target?.getHermit()

				if (!targetHermit) return

				if (
					attack.target?.health !== 10 ||
					!query.card.hasStatusEffect(PoisonEffect)(game, targetHermit)
				)
					return

				target = attack.target
			},
		)

		observer.subscribeWithPriority(
			game.hooks.afterAttack,
			afterAttack.ACHIEVEMENTS,
			() => {
				if (!target) return
				if (!target.health) {
					component.incrementGoalProgress({goal: 0})
				}
			},
		)
	},
}

export default EyeOfTheSpider
