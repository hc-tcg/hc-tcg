import {
	ObserverComponent,
	PlayerComponent,
	StatusEffectComponent,
} from '../components'
import {GameModel} from '../models/game-model'
import {onTurnEnd} from '../types/priorities'
import {StatusEffect, hiddenStatusEffect} from './status-effect'

const TurnSkippedEffect: StatusEffect<PlayerComponent> = {
	...hiddenStatusEffect,
	id: 'turn-skipped',
	onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		player: PlayerComponent,
		observer: ObserverComponent,
	): void {
		observer.subscribe(player.hooks.onTurnStart, () => {
			game.addBlockedActions(
				this.icon,
				'APPLY_EFFECT',
				'REMOVE_EFFECT',
				'SINGLE_USE_ATTACK',
				'PRIMARY_ATTACK',
				'SECONDARY_ATTACK',
				'PLAY_HERMIT_CARD',
				'PLAY_ITEM_CARD',
				'PLAY_SINGLE_USE_CARD',
				'PLAY_EFFECT_CARD',
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

export default TurnSkippedEffect
