import {
	ObserverComponent,
	PlayerComponent,
	StatusEffectComponent,
} from '../components'
import {GameModel} from '../models/game-model'
import {StatusEffect, systemStatusEffect} from './status-effect'

const CurseOfBindingEffect: StatusEffect<PlayerComponent> = {
	...systemStatusEffect,
	icon: 'binded',
	name: 'Curse of Binding',
	description: 'You can not switch your active hermit this turn.',
	onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		player: PlayerComponent,
		observer: ObserverComponent,
	) {
		observer.subscribe(player.hooks.onTurnStart, () => {
			game.addBlockedActions(this.icon, 'CHANGE_ACTIVE_HERMIT')
		})
		observer.subscribe(player.hooks.onTurnEnd, () => {
			effect.remove()
		})
	},
}

export default CurseOfBindingEffect
