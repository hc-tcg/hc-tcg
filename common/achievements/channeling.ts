import LightningRod from '../cards/attach/lightning-rod'
import {CardComponent} from '../components'
import {afterAttack, beforeAttack} from '../types/priorities'
import {achievement} from './defaults'
import {Achievement} from './types'

const Channeling: Achievement = {
	...achievement,
	numericId: 22,
	id: 'channeling',
	progressionMethod: 'sum',
	levels: [
		{
			name: 'Channeling',
			steps: 1,
			description:
				"While your active Hermit has red HP, use Lightning Rod to redirect an attack's damage away from them.",
		},
	],
	onGameStart(game, player, component, observer) {
		const {opponentPlayer} = player

		let damageRedirected = false,
			activeRow = player.activeRow

		observer.subscribe(opponentPlayer.hooks.onTurnStart, () => {
			damageRedirected = false
			activeRow = player.activeRow
		})

		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.RESOLVE_AFTER_MODIFIERS,
			(attack) => {
				if (attack.player.entity !== opponentPlayer.entity) return
				if (!activeRow?.health || activeRow.health > 90) return

				const history = attack.getHistory('redirect').find((history) => {
					const creator = game.components.get(history.source as any)
					if (!(creator instanceof CardComponent)) return false
					return creator.props.id === LightningRod.id
				})
				if (!history || history.value.from !== activeRow.entity) return

				damageRedirected = attack.calculateDamage() > 0
			},
		)

		observer.subscribeWithPriority(
			game.hooks.afterAttack,
			afterAttack.ACHIEVEMENTS,
			(_attack) => {
				if (!activeRow?.health || game.currentPlayerEntity === player.entity)
					return

				if (!damageRedirected) return
				component.updateGoalProgress({goal: 0})
				damageRedirected = false
			},
		)
	},
}

export default Channeling
