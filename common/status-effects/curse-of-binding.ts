import {
	ObserverComponent,
	PlayerComponent,
	StatusEffectComponent,
} from '../components'
import {GameModel} from '../models/game-model'
import {
	PlayerStatusEffect,
	StatusEffectProps,
	statusEffect,
} from './status-effect'

class CurseOfBindingEffect extends PlayerStatusEffect {
	props: StatusEffectProps = {
		...statusEffect,
		icon: 'binded',
		name: 'Curse of Binding',
		description: 'You can not switch your active hermit this turn.',
	}

	public override onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		player: PlayerComponent,
		observer: ObserverComponent,
	) {
		observer.subscribe(player.hooks.onTurnStart, () => {
			game.addBlockedActions(this.props.icon, 'CHANGE_ACTIVE_HERMIT')
		})
		observer.subscribe(player.hooks.onTurnEnd, () => {
			effect.remove()
		})
	}
}

export default CurseOfBindingEffect
