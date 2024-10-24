import {
	ObserverComponent,
	PlayerComponent,
	StatusEffectComponent,
} from '../components'
import {GameModel} from '../models/game-model'
import {onTurnEnd} from '../types/priorities'
import {StatusEffect, systemStatusEffect} from './status-effect'

const CurseOfBindingEffect: StatusEffect<PlayerComponent> = {
	...systemStatusEffect,
	id: 'binded',
	icon: 'binded',
	name: 'Curse of Binding',
	description: 'You can not switch your active hermit this turn.',
	applyCondition: (_game, value) =>
		value instanceof PlayerComponent &&
		!value.hasStatusEffect(CurseOfBindingEffect),
	onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		player: PlayerComponent,
		observer: ObserverComponent,
	) {
		observer.subscribe(player.hooks.onTurnStart, () => {
			game.addBlockedActions(this.icon, 'CHANGE_ACTIVE_HERMIT')
		})
		observer.subscribeWithPriority(
			player.hooks.onTurnEnd,
			onTurnEnd.ON_STATUS_EFFECT_TIMEOUT,
			() => {
				effect.remove()
			},
		)
	},
}

export default CurseOfBindingEffect
