import FishingRod from '../cards/single-use/fishing-rod'
import {SlotComponent} from '../components'
import query from '../components/query'
import {afterApply} from '../types/priorities'
import {achievement} from './defaults'
import {Achievement} from './types'

const MCCFishing: Achievement = {
	...achievement,
	numericId: 56,
	id: 'mcc-fishing',
	progressionMethod: 'sum',
	levels: [
		{
			name: 'MCC Fishing',
			description: 'Draw 100 cards with fishing rod.',
			steps: 100,
		},
	],
	onGameStart(game, player, component, observer) {
		observer.subscribeWithPriority(
			player.hooks.afterApply,
			afterApply.CHECK_BOARD_STATE,
			() => {
				let su = game.components.find(SlotComponent, query.slot.singleUse)?.card
				if (!su) return
				if (su.props.id !== FishingRod.id) return

				component.updateGoalProgress({goal: 0, progress: 2})
			},
		)
	},
}

export default MCCFishing
