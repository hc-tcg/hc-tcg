import {
	ObserverComponent,
	PlayerComponent,
	StatusEffectComponent,
} from '../components'
import {GameModel} from '../models/game-model'
import {StatusEffect, systemStatusEffect} from './status-effect'

const NaughtyRegiftEffect: StatusEffect<PlayerComponent> = {
	...systemStatusEffect,
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
		observer.subscribe(player.hooks.afterAttack, (_attack) => {
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
		})

		observer.subscribe(player.hooks.onTurnEnd, () => {
			effect.remove()
		})
	},
}

export default NaughtyRegiftEffect
