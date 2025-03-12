import {achievement} from './defaults'
import {Achievement} from './types'

const ServerLag: Achievement = {
	...achievement,
	numericId: 9,
	id: 'server_lag',
	progressionMethod: 'sum',
	levels: [
		{
			name: 'Server Lag',
			description:
				'Deal the final blow of the game using a Hermit you got as a prize card.',
			steps: 1,
		},
	],
	onGameEnd(game, player, component, outcome) {
		/** Prevents getting progress from forfeiting after attacking with a prize card */
		if (
			outcome.type === 'player-won' &&
			outcome.victoryReason === 'forfeit' &&
			outcome.winner !== player.entity
		)
			return
		const playerLatestAttack = player.lastHermitAttackInfo?.at(-1)
		if (
			!playerLatestAttack ||
			playerLatestAttack.turn < game.state.turn.turnNumber ||
			!playerLatestAttack.attacker.prizeCard
		)
			return
		component.updateGoalProgress({goal: 0})
	},
}

export default ServerLag
