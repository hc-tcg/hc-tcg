import {achievement} from './defaults'
import {Achievement} from './types'

const TagTeam: Achievement = {
	...achievement,
	numericId: 55,
	id: 'tag_team',
	progressionMethod: 'best',
	levels: [
		{
			name: 'Tag Team',
			description: 'Win a game after swapping your active Hermit 6 times.',
			steps: 6,
		},
	],
	onGameStart(game, player, component, observer) {
		let activeRowChangedNumber = -1

		observer.subscribe(player.hooks.onActiveRowChange, () => {
			activeRowChangedNumber += 1
		})

		observer.subscribe(game.hooks.onGameEnd, (outcome) => {
			if (outcome.type !== 'player-won' || outcome.winner !== player.entity)
				return
			component.updateGoalProgress({goal: 0, progress: activeRowChangedNumber})
		})
	},
}

export default TagTeam
