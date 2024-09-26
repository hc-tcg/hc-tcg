import {
	ObserverComponent,
	PlayerComponent,
	StatusEffectComponent,
} from '../components'
import {GameModel} from '../models/game-model'
import {afterAttack, onTurnEnd} from '../types/priorities'
import {StatusEffect, systemStatusEffect} from './status-effect'

const NaughtyRegiftEffect: StatusEffect<PlayerComponent> = {
	...systemStatusEffect,
	id: 'regift',
	icon: 'regift',
	name: 'Regift',
	description: 'You may attack twice this turn.',
	applyCondition: (_game, value) => {
		return (
			value instanceof PlayerComponent &&
			!value.hasStatusEffect(NaughtyRegiftEffect)
		)
	},
	onApply(
		game: GameModel,
		effect: StatusEffectComponent<PlayerComponent>,
		player: PlayerComponent,
		observer: ObserverComponent,
	): void {
		observer.subscribeWithPriority(
			player.hooks.afterAttack,
			afterAttack.UPDATE_POST_ATTACK_STATE,
			(_attack) => {
				if (game.currentPlayerEntity !== player.entity) return
				if (!game.state.turn.completedActions.includes('PRIMARY_ATTACK')) return // Wait until Grianch flips tails on Naughty
				game.removeCompletedActions(
					'PRIMARY_ATTACK',
					'SECONDARY_ATTACK',
					'SINGLE_USE_ATTACK',
				)
				game.removeBlockedActions(
					'game',
					'PRIMARY_ATTACK',
					'SECONDARY_ATTACK',
					'SINGLE_USE_ATTACK',
				)
				effect.remove()
			},
		)

		observer.subscribeWithPriority(
			player.hooks.onTurnEnd,
			onTurnEnd.ON_STATUS_EFFECT_TIMEOUT,
			() => {
				effect.remove()
			},
		)
	},
}

export default NaughtyRegiftEffect
