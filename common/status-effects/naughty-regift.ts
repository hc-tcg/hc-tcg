import {PlayerStatusEffect, StatusEffectProps, systemStatusEffect} from './status-effect'
import {GameModel} from '../models/game-model'
import {ObserverComponent, PlayerComponent, StatusEffectComponent} from '../components'

class NaughtyRegiftEffect extends PlayerStatusEffect {
	props: StatusEffectProps = {
		...systemStatusEffect,
		icon: 'regift',
		name: 'Regift',
		description: 'You may attack twice this turn.',
		applyCondition: (_game, value) => {
			return value instanceof PlayerComponent && !value.hasStatusEffect(NaughtyRegiftEffect)
		},
	}

	override onApply(
		game: GameModel,
		effect: StatusEffectComponent<PlayerComponent>,
		player: PlayerComponent,
		observer: ObserverComponent
	): void {
		observer.subscribe(player.hooks.afterAttack, (_attack) => {
			if (game.currentPlayerEntity !== player.entity) return
			if (!game.state.turn.completedActions.includes('PRIMARY_ATTACK')) return // Wait until Grianch flips tails on Naughty
			game.removeCompletedActions('PRIMARY_ATTACK', 'SECONDARY_ATTACK', 'SINGLE_USE_ATTACK')
			game.removeBlockedActions('game', 'PRIMARY_ATTACK', 'SECONDARY_ATTACK', 'SINGLE_USE_ATTACK')
			effect.remove()
		})

		observer.subscribe(player.hooks.onTurnEnd, () => {
			effect.remove()
		})
	}
}

export default NaughtyRegiftEffect
