import FishingRod from '../cards/single-use/fishing-rod'
import Mending from '../cards/single-use/mending'
import {SlotComponent} from '../components'
import query from '../components/query'
import {achievement} from './defaults'
import {Achievement} from './types'

const GoFish: Achievement = {
	...achievement,
	numericId: 20,
	id: 'go-fish',
	levels: [
		{
			name: 'Go Fish',
			description: 'Fish a Mending book',
			steps: 1,
		},
	],
	onGameStart(game, playerEntity, component, observer) {
		const player = game.components.get(playerEntity)
		if (!player) return

		let numberOfMendingsAtStartOfTurnOrAfterUsingSingleUse = 0

		observer.subscribe(player.hooks.onTurnStart, () => {
			numberOfMendingsAtStartOfTurnOrAfterUsingSingleUse = player
				.getHand()
				.filter((x) => x.props.id === Mending.id).length
		})

		observer.subscribe(player.hooks.afterApply, () => {
			let su = game.components
				.find(SlotComponent, query.slot.singleUse)
				?.getCard()
			if (!su) return
			if (su.props.id !== FishingRod.id) return

			const numberOfMendingsNow = player
				.getHand()
				.filter((x) => x.props.id === Mending.id).length

			if (
				numberOfMendingsAtStartOfTurnOrAfterUsingSingleUse < numberOfMendingsNow
			) {
				component.incrementGoalProgress({goal: 0})
			}

			// We need to recount the number of mendings incase the player uses multiple single use cards in one turn
			numberOfMendingsAtStartOfTurnOrAfterUsingSingleUse = numberOfMendingsNow
		})
	},
}

export default GoFish
