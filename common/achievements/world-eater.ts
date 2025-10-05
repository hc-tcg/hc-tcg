import {CardComponent} from '../components'
import {achievement} from './defaults'
import {Achievement} from './types'

const WorldEater: Achievement = {
	...achievement,
	numericId: 60,
	id: 'world-eater',
	progressionMethod: 'best',
	levels: [
		{
			name: 'World Eater',
			description:
				'Draw 5 cards in one turn.',
			steps: 5,
		},
	],
	onGameStart(game, player, component, observer) {
		var cardsDrawn = 0

        game.components.filter(CardComponent).forEach((card) => {
            observer.subscribe(card.hooks.onChangeSlot, (newSlot, oldSlot) => {
                if (!oldSlot.inDeck()) return
                if (newSlot.player.entity !== player.entity) return
                cardsDrawn += 1
                component.updateGoalProgress({goal: 0, progress: cardsDrawn})
            })
        })

        observer.subscribe(player.hooks.onTurnStart, () => cardsDrawn = 0)
	},
}

export default WorldEater
