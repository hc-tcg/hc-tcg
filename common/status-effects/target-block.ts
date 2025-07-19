import LightningRod from '../cards/attach/lightning-rod'
import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../components'
import {GameModel} from '../models/game-model'
import {beforeAttack, onTurnEnd} from '../types/priorities'
import query from './../components/query'
import SingleUseBlockedEffect from './single-use-blocked'
import {Counter, systemStatusEffect} from './status-effect'

export const TargetBlockEffect: Counter<CardComponent> = {
	...systemStatusEffect,
	id: 'target-block',
	icon: 'target-block',
	name: 'Target Acquired',
	description: 'This hermit will take all damage next turn.',
	counter: 1,
	counterType: 'turns',
	onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		target: CardComponent,
		observer: ObserverComponent,
	) {
		let {opponentPlayer} = target

		effect.counter = this.counter

		// Redirect all future attacks this turn

		observer.subscribe(opponentPlayer.hooks.onTurnStart, () => {
			if (effect.counter === 0) {
				effect.description = 'This hermit will take all damage this turn.'
			}
			game.components
				.new(StatusEffectComponent, SingleUseBlockedEffect, target.entity)
				.apply(opponentPlayer.entity)
		})

		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.IGNORE_CARDS,
			(attack) => {
				if (effect.counter != 0) return
				if (attack.player.entity !== target.opponentPlayer.entity) return
				if (!target.slot.inRow()) return
				attack.shouldIgnoreCards.push(query.card.is(LightningRod))
			},
		)

		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.TARGET_BLOCK_REDIRECT,
			(attack) => {
				if (effect.counter != 0) return
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
				if (effect.counter === 0) effect.remove()
				if (effect.counter !== null) effect.counter--
			},
		)
	},
}
