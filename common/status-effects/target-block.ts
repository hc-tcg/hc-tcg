import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../components'
import {GameModel} from '../models/game-model'
import {beforeAttack, onTurnEnd} from '../types/priorities'
import {StatusEffect, systemStatusEffect} from './status-effect'

export const TargetBlockEffect: StatusEffect<CardComponent> = {
	...systemStatusEffect,
	id: 'target-block',
	icon: 'target-block',
	name: 'Made the target!',
	description: (_component) => 'This hermit will take all damage this turn.',
	onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		target: CardComponent,
		observer: ObserverComponent,
	) {
		let {opponentPlayer} = target
		// Redirect all future attacks this turn
		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.TARGET_BLOCK_REDIRECT,
			(attack) => {
				if (attack.player.entity !== opponentPlayer.entity) return
				if (attack.isType('status-effect') || attack.isBacklash) return
				if (!target.slot.inRow()) return
				attack.redirect(effect.entity, target.slot.row.entity)
			},
		)

		observer.subscribeWithPriority(
			opponentPlayer.hooks.onTurnEnd,
			onTurnEnd.ON_STATUS_EFFECT_TIMEOUT,
			() => {
				effect.remove()
			},
		)
	},
}
