import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../components'
import {GameModel} from '../models/game-model'
import {StatusEffect, systemStatusEffect} from './status-effect'

export const TargetBlockEffect: StatusEffect<CardComponent> = {
	...systemStatusEffect,
	id: 'target-block',
	icon: 'target-block',
	name: 'Made the target!',
	description: 'This hermit will take all damage this turn.',
	onApply(
		_game: GameModel,
		effect: StatusEffectComponent,
		target: CardComponent,
		observer: ObserverComponent,
	) {
		let {opponentPlayer} = target
		// Redirect all future attacks this turn
		observer.subscribe(opponentPlayer.hooks.beforeAttack, (attack) => {
			if (attack.isType('status-effect') || attack.isBacklash) return
			if (!target.slot.inRow()) return
			attack.redirect(effect.entity, target.slot.row.entity)
		})

		observer.subscribe(opponentPlayer.hooks.onTurnEnd, () => {
			effect.remove()
		})
	},
}
