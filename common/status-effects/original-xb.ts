import {PlayerStatusEffect, StatusEffectProps, systemStatusEffect} from './status-effect'
import {GameModel} from '../models/game-model'
import {ObserverComponent, PlayerComponent, StatusEffectComponent} from '../components'

class OriginalXbEffect extends PlayerStatusEffect {
	props: StatusEffectProps = {
		...systemStatusEffect,
		icon: 'originalxb',
		name: 'Get Good',
		description: 'Draw an additional card at the end of your turn.',
	}

	override onApply(
		_game: GameModel,
		effect: StatusEffectComponent<PlayerComponent>,
		player: PlayerComponent,
		observer: ObserverComponent
	): void {
		observer.oneShot(player.hooks.onTurnEnd, () => {
			player.draw(1)
			effect.remove()
		})
	}
}

export default OriginalXbEffect
