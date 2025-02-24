import {CardComponent} from '../components'
import query from '../components/query'
import {getDeckCost} from '../utils/ranks'
import {achievement} from './defaults'
import {Achievement} from './types'

const NoDerpcoins: Achievement = {
	...achievement,
	numericId: 7,
	id: 'no_derpcoins',
	levels: [
		{
			name: 'No Derpcoins Required',
			description: 'Defeat Evil X using a 0 token deck.',
			steps: 1,
		},
	],
	onGameStart(game, playerEntity, component, observer) {
		if (!game.state.isEvilXBossGame) return
		const cost = getDeckCost(
			game.components
				.filter(CardComponent, query.card.player(playerEntity))
				.map((card) => card.props),
		)
		if (cost > 0) return
		observer.subscribe(game.hooks.onGameEnd, (outcome) => {
			if (outcome.type !== 'player-won') return
			if (outcome.winner !== playerEntity) return
			component.incrementGoalProgress({goal: 0})
		})
	},
}

export default NoDerpcoins
