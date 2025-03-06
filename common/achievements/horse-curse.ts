import query from '../components/query'
import SleepingEffect from '../status-effects/sleeping'
import {achievement} from './defaults'
import {Achievement} from './types'

const HorseCurse: Achievement = {
	...achievement,
	numericId: 54,
	id: 'horse_curse',
	levels: [
		{
			name: 'Horse Curse',
			description: 'KO a Hermit while your active Hermit is sleeping.',
			steps: 1,
		},
	],
	onGameStart(game, player, component, observer) {
		game.components
			.filter(RowComponent, query.row.player(player.opponentPlayer.entity))
			.forEach((row) => {
				observer.subscribe(row.hooks.onKnockOut, () => {
					if (player.activeRow.getHermit().getStatusEffect(SleepingEffect)) {
						component.incrementGoalProgress({goal: 0})
					}
				})
			})
	},
}

export default HorseCurse
