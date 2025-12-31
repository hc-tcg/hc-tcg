import TNT from '../cards/single-use/tnt'
import {SlotComponent} from '../components'
import query from '../components/query'
import {afterApply, afterAttack} from '../types/priorities'
import {achievement} from './defaults'
import {Achievement} from './types'

const BlastProtection: Achievement = {
	...achievement,
	numericId: 64,
	id: 'blast-protection',
	progressionMethod: 'sum',
	levels: [
		{
			name: 'Blast Protection',
			description: 'Use TNT without your Active Hermit taking damage',
			steps: 1,
		},
	],
	onGameStart(game, player, component, observer) {
		var initialHealth: number = 0

		observer.subscribeWithPriority(
			player.hooks.afterApply,
			afterApply.CHECK_BOARD_STATE,
			() => {
				if (!player.activeRow?.health) return

				const su = game.components.find(
					SlotComponent,
					query.slot.singleUse,
				)?.card
				if (!su) return
				if (su.props.id !== TNT.id) return
				initialHealth = player.activeRow.health

				observer.subscribeWithPriority(
					game.hooks.afterAttack,
					afterAttack.ACHIEVEMENTS,
					() => {
						observer.unsubscribe(game.hooks.afterAttack)

						if (!player.activeRow?.health) return
						if (player.activeRow.health !== initialHealth) return

						component.updateGoalProgress({goal: 0})
					},
				)
			},
		)
	},
}

export default BlastProtection
