import {CardComponent} from '../components'
import {achievement} from './defaults'
import {Achievement} from './types'

const PeskyBird: Achievement = {
	...achievement,
	numericId: 10,
	id: 'pesky_bird',
	levels: [
		{
			name: 'Pesky Bird',
			description: 'Force your opponent to discard 7 cards in one game.',
			steps: 7,
		},
	],
	onGameStart(game, playerEntity, component, observer) {
		const player = game.components.get(playerEntity)
		if (!player) return

		let forcedDiscards = 0

		// Let it be known that I hate this
		game.components.filter(CardComponent).forEach((cardComponent) => {
			observer.subscribe(cardComponent.hooks.onChangeSlot, (newSlot) => {
				if (!newSlot.inDiscardPile()) return
				if (game.currentPlayerEntity !== playerEntity) return
				forcedDiscards += 1
				component.bestGoalProgress({goal: 0, progress: forcedDiscards})
			})
		})
	},
}

export default PeskyBird
