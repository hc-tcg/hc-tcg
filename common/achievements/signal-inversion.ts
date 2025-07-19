import BadOmenEffect from '../status-effects/bad-omen'
import FortuneEffect from '../status-effects/fortune'
import {afterAttack, onCoinFlip} from '../types/priorities'
import {achievement} from './defaults'
import {Achievement} from './types'

const SignalInversion: Achievement = {
	...achievement,
	numericId: 52,
	id: 'signal-inversion',
	progressionMethod: 'sum',
	levels: [
		{
			name: 'Signal Inversion',
			description:
				'Use Fortune to flip heads while your active Hermit has the Bad Omen status effect.',
			steps: 1,
		},
	],
	onGameStart(game, player, component, observer) {
		let hasFlippedThisTurn = false

		observer.subscribe(player.hooks.onTurnStart, () => {
			hasFlippedThisTurn = false
		})

		observer.subscribeWithPriority(
			player.hooks.onCoinFlip,
			onCoinFlip.ACHIEVEMENTS,
			(flips) => {
				hasFlippedThisTurn = true
				return flips
			},
		)

		observer.subscribeWithPriority(
			game.hooks.afterAttack,
			afterAttack.ACHIEVEMENTS,
			(attack) => {
				if (attack.player.entity !== player.entity) return
				if (!hasFlippedThisTurn) return
				let hasBadOmen = player
					.getActiveHermit()
					?.getStatusEffect(BadOmenEffect)
				if (!hasBadOmen) return
				if (!player.hasStatusEffect(FortuneEffect)) return

				component.updateGoalProgress({goal: 0})
				hasFlippedThisTurn = false
			},
		)
	},
}

export default SignalInversion
