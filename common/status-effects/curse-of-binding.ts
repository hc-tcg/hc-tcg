import {StatusEffectComponent, ObserverComponent, PlayerComponent} from '../components'
import {GameModel} from '../models/game-model'
import {PlayerStatusEffect, StatusEffectProps, hiddenStatusEffect} from './status-effect'

class CurseOfBindingEffect extends PlayerStatusEffect {
	props: StatusEffectProps = {
		...hiddenStatusEffect,
		id: 'curse-of-binding',
		name: 'Curse of Binding',
		description: 'You can not switch your active hermit this turn.',
	}

	public override onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		player: PlayerComponent,
		observer: ObserverComponent
	) {
		observer.subscribe(player.hooks.onTurnStart, () => {
			game.addBlockedActions(this.props.id, 'CHANGE_ACTIVE_HERMIT')
		})

		observer.subscribe(player.hooks.onTurnEnd, () => {
			effect.remove()
		})
	}
}

export default CurseOfBindingEffect
