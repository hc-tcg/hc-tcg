import LightningRod from '../cards/attach/lightning-rod'
import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../components'
import {GameModel} from '../models/game-model'
import {beforeAttack, onTurnEnd} from '../types/priorities'
import query from './../components/query'
import {StatusEffect, systemStatusEffect} from './status-effect'

export const TargetBlockEffect: StatusEffect<CardComponent> = {
	...systemStatusEffect,
	id: 'target-block',
	icon: 'target-block',
	name: 'Made the target!',
	description: 'This hermit will take all damage this turn.',
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
			beforeAttack.IGNORE_CARDS,
			(attack) => {
				if (attack.player.entity !== target.opponentPlayer.entity) return
				if (!target.slot.inRow()) return
				attack.shouldIgnoreCards.push(query.card.is(LightningRod))
			},
		)

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
