import assert from 'assert'
import LightningRod from '../cards/attach/lightning-rod'
import TargetBlock from '../cards/single-use/target-block'
import {CardComponent} from '../components'
import query from '../components/query'
import {Entity} from '../entities'
import {afterAttack} from '../types/priorities'
import {achievement} from './defaults'
import {Achievement} from './types'

const TargetedLightning: Achievement = {
	...achievement,
	numericId: 1,
	id: 'decked_out',
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
				attack.getHistory().find((history) => {
					if (!history.source) return false
					if (history.type === 'redirect') return false
					let source = game.components.get(
						history.source as Entity<CardComponent>,
					)
					if (!(source instanceof CardComponent)) return false
					if (source.props.id !== TargetBlock.id) return false
					return true
				})

				if (
					game.components.find(
						CardComponent,
						query.card.is(LightningRod),
						query.card.slot(query.slot.opponent, query.slot.active),
					)
				) {
					component.incrementGoalProgress({goal: 0})
				}
			},
		)
	},
}

export default TargetedLightning
