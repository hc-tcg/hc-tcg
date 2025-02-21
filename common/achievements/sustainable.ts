import assert from 'assert'
import {CardComponent} from '../components'
import query from '../components/query'
import {achievement} from './defaults'
import {Achievement} from './types'
import Composter from '../cards/single-use/composter'

const SUStainable: Achievement = {
	...achievement,
	numericId: 19,
	id: 'sustainable',
	name: 'SUStainable',
	description: 'Compost 100 cards.',
	steps: 100,
	icon: 'sustainable',
	onGameStart(game, playerEntity, component, observer) {
		let player = game.components.get(playerEntity)!

		observer.subscribe(player.hooks.afterApply, () => {
			let su = game.components.find(
				CardComponent,
				query.card.slot(query.slot.singleUse),
			)

			assert(
				su,
				'There should be a single use card in the single use slot if a sigle use card is applied',
			)

			if (su.props.id !== Composter.id) return

			let handSize = player.getHand().length
			let numUsed = Math.min(handSize - 1, 2)
			console.log(numUsed)

			component.incrementGoalProgress({goal: 0, amount: numUsed})
		})
	},
}

export default SUStainable
