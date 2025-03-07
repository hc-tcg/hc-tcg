import LightningRod from '../cards/attach/lightning-rod'
import {CardComponent} from '../components'
import {afterAttack} from '../types/priorities'
import {achievement} from './defaults'
import {Achievement} from './types'

const Channeling: Achievement = {
	...achievement,
	numericId: 22,
	id: 'channeling',
	levels: [
		{
			name: 'Channeling',
			steps: 1,
			description:
				'Redirect KO worthy damage away from your active Hermit with Lightning Rod.',
		},
	],
	onGameStart(game, player, component, observer) {
		observer.subscribeWithPriority(
			game.hooks.afterAttack,
			afterAttack.ACHIEVEMENTS,
			(attack) => {
				if (attack.player.entity !== player.opponentPlayer.entity) return
				const target = attack.target
				if (target === player.activeRowEntity) return
				if (!target || target.health) return
				if (
					!attack.getHistory('redirect').find((history) => {
						let creator = game.components.get(history.source as any)
						if (!(creator instanceof CardComponent)) return
						return creator.props.id === LightningRod.id
					})
				)
					return

				if (
					player.activeRow?.health &&
					attack.getDamage() > player.activeRow.health
				) {
					component.incrementGoalProgress({goal: 0})
				}
			},
		)
	},
}

export default Channeling
