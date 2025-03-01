import assert from 'assert'
import LightningRod from '../cards/attach/lightning-rod'
import {CardComponent} from '../components'
import query from '../components/query'
import {TargetBlockEffect} from '../status-effects/target-block'
import {afterAttack} from '../types/priorities'
import {achievement} from './defaults'
import {Achievement} from './types'

const TargetedLightning: Achievement = {
	...achievement,
	numericId: 22,
	id: 'targeted_lightning',
	levels: [
		{
			name: 'Targeted Lightning',
			steps: 1,
			description:
				'Knock out an AFK Hermit with target block while the opponent has a lightning rod on the board.',
		},
	],
	onGameStart(game, player, component, observer) {
		let incrementGoalProgress = false

		observer.subscribeWithPriority(
			game.hooks.afterAttack,
			afterAttack.ACHIEVEMENTS,
			(attack) => {
				if (incrementGoalProgress) return
				if (attack.player.entity !== player.entity) return
				const target = attack.target
				if (!target || target.health) return
				const targetEffect = target
					.getHermit()
					?.getStatusEffect(TargetBlockEffect)
				if (!targetEffect) return
				if (
					!attack
						.getHistory('redirect')
						.find((history) => history.source === targetEffect.entity)
				)
					return

				if (
					game.components.find(
						CardComponent,
						query.card.is(LightningRod),
						query.card.slot(query.slot.opponent, query.slot.attach),
					)
				) {
					incrementGoalProgress = true
					observer.subscribe(target.hooks.onKnockOut, () => {
						component.incrementGoalProgress({goal: 0})
						observer.unsubscribe(target.hooks.onKnockOut)
						incrementGoalProgress = false
					})
				}
			},
		)
	},
}

export default TargetedLightning
