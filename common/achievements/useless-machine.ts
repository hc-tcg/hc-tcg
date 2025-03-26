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
	progressionMethod: 'best',
	levels: [
		{
			name: 'Useless Machine',
			description: 'Compost 2 cards and draw the same cards again.',
			steps: 2,
		},
	],
	onGameStart(game, player, component, observer) {
		let playerHand: Array<string> = []

		observer.subscribe(player.hooks.onAttach, (slot) => {
			if (!slot.isSingleUse()) return
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

				for (const card of playerHand) {
					let index = newPlayerHand.indexOf(card)
					if (index === -1) continue
					newPlayerHand.splice(index, 1)
				}

				if (newPlayerHand.length == 1) {
					component.updateGoalProgress({goal: 0, progress: 1})
				} else if (newPlayerHand.length == 0) {
					component.updateGoalProgress({goal: 0, progress: 2})
				}
			},
		)
	},
}

export default UselessMachine
