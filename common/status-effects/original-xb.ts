import {
	ObserverComponent,
	PlayerComponent,
	StatusEffectComponent,
} from '../components'
import {GameModel} from '../models/game-model'
import {StatusEffect, systemStatusEffect} from './status-effect'

const OriginalXbEffect: StatusEffect<PlayerComponent> = {
	...systemStatusEffect,
	icon: 'originalxb',
	name: 'Get Good',
	description: 'Draw an additional card at the end of your turn.',
	onApply(
		_game: GameModel,
		effect: StatusEffectComponent<PlayerComponent>,
		player: PlayerComponent,
		observer: ObserverComponent,
	): void {
		observer.oneShot(player.hooks.onTurnEnd, () => {
			player.draw(1)
			effect.remove()
		})
	},
}

export default OriginalXbEffect
