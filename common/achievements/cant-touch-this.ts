import {CardComponent} from '../components'
import {afterAttack} from '../types/priorities'
import {achievement} from './defaults'
import {Achievement} from './types'

const CantTouchThis: Achievement = {
	...achievement,
	numericId: 11,
	id: 'cant_touch_this',
	progressionMethod: 'best',
	levels: [
		{
			name: "Can't Touch This!",
			description: 'Take 0 damage from 3 consecutive opponent attacks.',
			steps: 3,
		},
	],
	onGameStart(game, player, component, observer) {
		const {opponentPlayer} = player

		let missedAttacks = 0
		let wasAttacked = false,
			tookDamage = false

		observer.subscribe(opponentPlayer.hooks.onTurnStart, () => {
			wasAttacked = false
			tookDamage = false
		})

		observer.subscribeWithPriority(
			game.hooks.afterAttack,
			afterAttack.ACHIEVEMENTS,
			(attack) => {
				if (!(attack.attacker instanceof CardComponent)) return
				if (attack.player !== opponentPlayer) return
				if (attack.isBacklash) return
				wasAttacked = true
				if (attack.calculateDamage() > 0 && attack.target?.player === player) {
					tookDamage = true
				}
			},
		)

		observer.subscribe(player.hooks.onTurnStart, () => {
			if (!wasAttacked) return
			if (tookDamage) {
				missedAttacks = 0
				return
			}
			missedAttacks += 1
			component.updateGoalProgress({goal: 0, progress: missedAttacks})
		})
	},
}

export default CantTouchThis
