import {StatusEffectComponent, ObserverComponent, PlayerComponent} from '../components'
import {GameModel} from '../models/game-model'
import {hiddenStatusEffect, PlayerStatusEffect, StatusEffectProps} from './status-effect'

class TurnSkippedEffect extends PlayerStatusEffect {
	props: StatusEffectProps = hiddenStatusEffect

	public override onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		player: PlayerComponent,
		observer: ObserverComponent
	): void {
		observer.subscribe(player.hooks.onTurnStart, () => {
			game.addBlockedActions(
				this.props.icon,
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
