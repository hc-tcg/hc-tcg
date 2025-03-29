import {
	ObserverComponent,
	PlayerComponent,
	StatusEffectComponent,
} from '../components'
import {GameModel} from '../models/game-model'
import {beforeAttack} from '../types/priorities'
import {StatusEffect, hiddenStatusEffect} from './status-effect'

const DisappointingSwapEffect: StatusEffect<PlayerComponent> = {
	...hiddenStatusEffect,
	id: 'disappointing-swap',
	onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		player: PlayerComponent,
		observer: ObserverComponent,
	): void {
		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.REACT_TO_DAMAGE,
			() => {
				if (!player.activeRow || !player.activeRow.health || !player.opponentPlayer.activeRow || !player.opponentPlayer.activeRow.health) return
				let placeholder = player.activeRow.health
				player.activeRow.health = player.opponentPlayer.activeRow.health
				player.opponentPlayer.activeRow.health = placeholder

				effect.remove()
			}
		)
	},
}

export default DisappointingSwapEffect
