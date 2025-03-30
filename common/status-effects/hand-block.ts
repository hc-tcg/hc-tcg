import {
	ObserverComponent,
	PlayerComponent,
	StatusEffectComponent,
} from '../components'
import {GameModel} from '../models/game-model'
import {onTurnEnd} from '../types/priorities'
import {StatusEffect, hiddenStatusEffect} from './status-effect'

const HandBlockEffect: StatusEffect<PlayerComponent> = {
	...hiddenStatusEffect,
	id: 'hand-block',
	onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		player: PlayerComponent,
		observer: ObserverComponent,
	): void {
		observer.subscribe(player.hooks.onTurnStart, () => {
			game.addBlockedActions(
				this.id,
				'APPLY_EFFECT',
				'REMOVE_EFFECT',
				'SINGLE_USE_ATTACK',
				'PRIMARY_ATTACK',
				'SECONDARY_ATTACK',
			)
		})
		observer.subscribeWithPriority(
			player.hooks.onTurnEnd,
			onTurnEnd.ON_STATUS_EFFECT_TIMEOUT,
			() => {
				effect.remove()
			},
		)
	},
}

export default HandBlockEffect
