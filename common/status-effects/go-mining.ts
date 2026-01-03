import {
	ObserverComponent,
	PlayerComponent,
	StatusEffectComponent,
} from '../components'
import query from '../components/query'
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
		game: GameModel,
		effect: StatusEffectComponent<PlayerComponent>,
		player: PlayerComponent,
		observer: ObserverComponent,
	): void {
		const predecessor = game.components.find(
			StatusEffectComponent,
			query.effect.is(GoMiningEffect),
			query.effect.targetEntity(player.entity),
			(_game, value) => value.entity !== effect.entity,
		)
		if (predecessor) {
			if (predecessor.counter !== null) predecessor.counter++
			effect.remove()
			return
		}

		observer.subscribeWithPriority(
			player.hooks.onTurnEnd,
			onTurnEnd.ON_STATUS_EFFECT_TIMEOUT,
			(drawCards) => {
				if (effect.counter) drawCards.push(...player.draw(effect.counter))
				effect.remove()
			},
		)
	},
}

export default GoMiningEffect
