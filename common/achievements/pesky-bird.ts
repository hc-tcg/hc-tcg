import {CardComponent} from '../components'
import {achievement} from './defaults'
import {Achievement} from './types'

const PeskyBird: Achievement = {
	...achievement,
	numericId: 10,
	id: 'pesky_bird',
	progressionMethod: 'best',
	levels: [
		{
			name: 'Pesky Bird',
			description:
				'Force your opponent to discard 5 cards from their hand in one game.',
			steps: 5,
		},
	],
	onGameStart(game, player, component, observer) {
		let forcedDiscards = 0

		game.components.filter(CardComponent).forEach((cardComponent) => {
			observer.subscribe(
				cardComponent.hooks.onChangeSlot,
				(newSlot, oldSlot) => {
					if (newSlot.player.entity === player.entity) return
					if (!oldSlot.inHand()) return
					if (!newSlot.inDiscardPile()) return
					if (game.currentPlayerEntity !== player.entity) return
					forcedDiscards += 1
					component.updateGoalProgress({goal: 0, progress: forcedDiscards})
				},
			)
		})
	},
}

export default PeskyBird
