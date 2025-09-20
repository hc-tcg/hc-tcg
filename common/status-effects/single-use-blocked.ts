import {
	ObserverComponent,
	PlayerComponent,
	StatusEffectComponent,
} from '../components'
import {GameModel} from '../models/game-model'
import {onTurnEnd} from '../types/priorities'
import {StatusEffect, systemStatusEffect} from './status-effect'

// @todo Only disable the proper slots. This is not doable until bloced actions are reworked.

const SingleUseBlockedEffect: StatusEffect<PlayerComponent> = {
	...systemStatusEffect,
	id: 'single-use-blocked',
	icon: 'single-use-blocked',
	name: 'Single Use Blocked',
	description: 'You cannot play a single use effect card.',
	applyCondition: (_game, value) => {
		return (
			value instanceof PlayerComponent &&
			!value.hasStatusEffect(SingleUseBlockedEffect)
		)
	},
	onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		target: PlayerComponent,
		observer: ObserverComponent,
	): void {
		const player = target
		const startBlocking = () => {
			game.addBlockedActions(effect.entity, 'PLAY_SINGLE_USE_CARD')
		}
		if (game.currentPlayer.entity === player.entity) startBlocking()
		else observer.subscribeBefore(player.hooks.onTurnStart, startBlocking)

		observer.subscribeWithPriority(
			player.hooks.onTurnEnd,
			onTurnEnd.ON_STATUS_EFFECT_TIMEOUT,
			() => {
				effect.remove()
			},
		)
	},
	onRemoval(game, effect, _target, _observer) {
		game.removeBlockedActions(effect.entity, 'PLAY_SINGLE_USE_CARD')
	},
}

export default SingleUseBlockedEffect
