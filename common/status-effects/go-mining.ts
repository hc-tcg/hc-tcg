import {
	ObserverComponent,
	PlayerComponent,
	StatusEffectComponent,
} from '../components'
import {GameModel} from '../models/game-model'
import {onTurnEnd} from '../types/priorities'
import {Counter, systemStatusEffect} from './status-effect'

const GoMiningEffect: Counter<PlayerComponent> = {
	...systemStatusEffect,
	id: 'go-mining',
	icon: 'go-mining',
	name: 'Go Mining',
	description:
		'Draw an additional card at the end of your turn for each level of this status effect.',
	counter: 1,
	counterType: 'number',
	onApply(
		_game: GameModel,
		effect: StatusEffectComponent<PlayerComponent>,
		player: PlayerComponent,
		observer: ObserverComponent,
	): void {
		if (!effect.counter) effect.counter = this.counter

		observer.subscribeWithPriority(
			player.hooks.onTurnEnd,
			onTurnEnd.ON_STATUS_EFFECT_TIMEOUT,
			() => {
				if (effect.counter) player.draw(effect.counter)
				effect.remove()
			},
		)
	},
}

export default GoMiningEffect
