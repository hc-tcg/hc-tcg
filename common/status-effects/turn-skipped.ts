import {StatusEffectComponent, ObserverComponent, PlayerComponent} from '../components'
import {GameModel} from '../models/game-model'
import {PlayerStatusEffect, StatusEffectProps, systemStatusEffect} from './status-effect'

class TurnSkippedEffect extends PlayerStatusEffect {
	props: StatusEffectProps = {
		...systemStatusEffect,
		id: 'turn-skipped',
		name: 'Turn Skipped',
		description: 'You cannot attack or play a card on your next turn.',
	}

	public override onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		player: PlayerComponent,
		observer: ObserverComponent
	): void {
		observer.subscribe(player.hooks.onTurnStart, () => {
			game.addBlockedActions(
				this.props.id,
				'APPLY_EFFECT',
				'REMOVE_EFFECT',
				'SINGLE_USE_ATTACK',
				'PRIMARY_ATTACK',
				'SECONDARY_ATTACK',
				'PLAY_HERMIT_CARD',
				'PLAY_ITEM_CARD',
				'PLAY_SINGLE_USE_CARD',
				'PLAY_EFFECT_CARD'
			)
		})
		observer.subscribe(player.hooks.onTurnEnd, () => {
			effect.remove()
		})
	}
}

export default TurnSkippedEffect
