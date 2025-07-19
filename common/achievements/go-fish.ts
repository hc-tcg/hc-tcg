import FishingRod from '../cards/single-use/fishing-rod'
import Mending from '../cards/single-use/mending'
import {SlotComponent} from '../components'
import query from '../components/query'
import {afterApply} from '../types/priorities'
import {achievement} from './defaults'
import {Achievement} from './types'

const GoFish: Achievement = {
	...achievement,
	numericId: 20,
	id: 'go-fish',
	progressionMethod: 'sum',
	levels: [
		{
			name: 'Go Fish',
			description: 'Fish a Mending book',
			steps: 1,
		},
	],
	onGameStart(game, player, component, observer) {
		let numberOfMendingsBeforeUse = 0

		observer.subscribe(player.hooks.beforeApply, () => {
			numberOfMendingsBeforeUse = player
				.getHand()
				.filter((x) => x.props.id === Mending.id).length
		})

		observer.subscribeWithPriority(
			player.hooks.afterApply,
			afterApply.CHECK_BOARD_STATE,
			() => {
				let su = game.components.find(SlotComponent, query.slot.singleUse)?.card
				if (!su) return
				if (su.props.id !== FishingRod.id) return

				const numberOfMendingsNow = player
					.getHand()
					.filter((x) => x.props.id === Mending.id).length

				if (numberOfMendingsBeforeUse < numberOfMendingsNow) {
					component.updateGoalProgress({goal: 0})
				}
			},
		)
	},
}

export default GoFish
