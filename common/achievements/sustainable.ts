import assert from 'assert'
import Composter from '../cards/single-use/composter'
import {CardComponent} from '../components'
import query from '../components/query'
import {afterApply} from '../types/priorities'
import {achievement} from './defaults'
import {Achievement} from './types'

const SUStainable: Achievement = {
	...achievement,
	numericId: 19,
	id: 'sustainable',
	progressionMethod: 'sum',
	levels: [
		{
			name: 'SUStainable',
			description: 'Compost 100 cards.',
			steps: 100,
		},
	],
	onGameStart(game, player, component, observer) {
		observer.subscribeWithPriority(
			player.hooks.afterApply,
			afterApply.CHECK_BOARD_STATE,
			() => {
				let su = game.components.find(
					CardComponent,
					query.card.slot(query.slot.singleUse),
				)

				assert(
					su,
					'There should be a single use card in the single use slot if a sigle use card is applied',
				)

				if (su.props.id !== Composter.id) return

				component.updateGoalProgress({goal: 0, progress: 2})
			},
		)
	},
}

export default SUStainable
