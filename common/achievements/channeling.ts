import LightningRod from '../cards/attach/lightning-rod'
import {CardComponent} from '../components'
import {afterAttack, beforeAttack} from '../types/priorities'
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
		const {opponentPlayer} = player

		let damageRedirected = 0

		observer.subscribe(opponentPlayer.hooks.onTurnStart, () => {
			damageRedirected = 0
		})

		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.RESOLVE_AFTER_MODIFIERS,
			(attack) => {
				if (attack.player.entity !== opponentPlayer.entity) return
				const history = attack.getHistory('redirect').find((history) => {
					let creator = game.components.get(history.source as any)
					if (!(creator instanceof CardComponent)) return false
					return creator.props.id === LightningRod.id
				})
				if (!history || history.value.from !== player.activeRowEntity) return
				damageRedirected += attack.calculateDamage()
			},
		)

		observer.subscribeWithPriority(
			game.hooks.afterAttack,
			afterAttack.ACHIEVEMENTS,
			(_attack) => {
				if (!player.activeRow?.health) return
				if (damageRedirected < player.activeRow.health) return

				component.incrementGoalProgress({goal: 0})
				damageRedirected = 0
			},
		)
	},
}

export default Channeling
