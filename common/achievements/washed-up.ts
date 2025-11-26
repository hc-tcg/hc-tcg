import WaterBucket from '../cards/attach/water-bucket'
import EthosLabUltraRare from '../cards/hermits/ethoslab-ultra-rare'
import {achievement} from './defaults'
import {Achievement} from './types'

const WashedUp: Achievement = {
	...achievement,
	numericId: 58,
	id: 'washed-up',
	progressionMethod: 'sum',
	levels: [
		{
			name: 'Washed Up',
			description: '???',
			steps: 1,
		},
	],
	onGameStart(_game, player, component, observer) {
		observer.subscribe(player.hooks.onAttach, (card) => {
			if (card.props !== WaterBucket) return
			if (!card.slot.inRow()) return
			if (card.slot.row.getHermit()?.props !== EthosLabUltraRare) return

			component.updateGoalProgress({goal: 0})
		})
	},
}

export default WashedUp
