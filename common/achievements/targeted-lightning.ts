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
	onGameStart(game, playerEntity, component, observer) {
		const player = game.components.get(playerEntity)
		assert(player)

		observer.subscribeWithPriority(
			game.hooks.afterAttack,
			afterAttack.ACHIEVEMENTS,
			(attack) => {
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
					component.incrementGoalProgress({goal: 0})
				}
			},
		)
	},
}

export default TargetedLightning
