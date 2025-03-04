import Composter from '../cards/single-use/composter'
import {SlotComponent} from '../components'
import query from '../components/query'
import {afterApply} from '../types/priorities'
import {achievement} from './defaults'
import {Achievement} from './types'

const UselessMachine: Achievement = {
	...achievement,
	numericId: 21,
	id: 'useless-machine',
	levels: [
		{
			name: 'Useless Machine',
			description: 'Compost 2 cards and draw the same cards again.',
			steps: 2,
		},
	],
	onGameStart(game, player, component, observer) {
		let playerHand: Array<string> = []

		observer.subscribe(player.hooks.beforeApply, () => {
			playerHand = player.getHand().map((card) => card.props.id)
		})

		observer.subscribeWithPriority(
			player.hooks.afterApply,
			afterApply.CHECK_BOARD_STATE,
			() => {
				let su = game.components.find(SlotComponent, query.slot.singleUse)?.card
				if (!su) return
				if (su.props.id !== Composter.id) return

				let newPlayerHand = player.getHand().map((card) => card.props.id)

				for (const card of newPlayerHand) {
					let index = playerHand.indexOf(card)
					playerHand.splice(index - 1, index + 1)
				}

				if (playerHand.length == 1) {
					component.bestGoalProgress({goal: 0, progress: 1})
				} else if (playerHand.length == 0) {
					component.bestGoalProgress({goal: 0, progress: 2})
				}
			},
		)
	},
}

export default UselessMachine
