import LightningRod from '../cards/attach/lightning-rod'
import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../components'
import {GameModel} from '../models/game-model'
import {beforeAttack, onTurnEnd} from '../types/priorities'
import query from './../components/query'
import {
	Counter,
	StatusEffect,
	statusEffect,
	systemStatusEffect,
} from './status-effect'

export const TargetBlockPrepareEffect: Counter<CardComponent> = {
	...statusEffect,
	id: 'target-block-prepare',
	icon: 'target-block',
	name: 'Take aim',
	description: 'Next turn, this hermit will take all damage.',
	counter: 1,
	counterType: 'number',
	onApply(_game, effect, target, observer) {
		const {opponentPlayer} = target

		observer.subscribe(opponentPlayer.hooks.onTurnStart, () => {
			if (!effect.counter) return
			effect.counter--

			if (effect.counter === 0) effect.remove()
		})
	},
	onRemoval(game, effect, target, _observer) {
		game.components
			.new(StatusEffectComponent, TargetBlockEffect, effect.creatorEntity)
			.apply(target.entity)
	},
}

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
