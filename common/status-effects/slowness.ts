import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../components'
import {GameModel} from '../models/game-model'
import {afterAttack, onTurnEnd} from '../types/priorities'
import {Counter, systemStatusEffect} from './status-effect'

const SlownessEffect: Counter<CardComponent> = {
	...systemStatusEffect,
	id: 'slowness',
	icon: 'slowness',
	name: 'Slowness',
	description: 'This Hermit can only use their primary attack.',
	counter: 1,
	counterType: 'turns',
	onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		target: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = target

		observer.subscribe(player.hooks.onTurnStart, () => {
			if (
				target.slot?.onBoard() &&
				player.activeRowEntity === target.slot.row?.entity
			)
				game.addBlockedActions(this.icon, 'SECONDARY_ATTACK')

			observer.subscribe(
				player.hooks.onActiveRowChange,
				(_oldHermit, newHermit) => {
					if (newHermit.entity === target.entity)
						game.addBlockedActions(effect.entity, 'SECONDARY_ATTACK')
					else game.removeBlockedActions(effect.entity, 'SECONDARY_ATTACK')
				},
			)
		})

		observer.subscribeWithPriority(
			player.hooks.onTurnEnd,
			onTurnEnd.ON_STATUS_EFFECT_TIMEOUT,
			() => {
				if (!effect.counter) return
				effect.counter--

				if (effect.counter === 0) {
					effect.remove()
					return
				}
			},
		)

		observer.subscribeWithPriority(
			game.hooks.afterAttack,
			afterAttack.UPDATE_POST_ATTACK_STATE,
			(attack) => {
				if (
					!target.slot?.onBoard() ||
					attack.target?.entity !== target.slot.row?.entity
				)
					return
				if (target.slot.row?.health) return
				effect.remove()
				game.removeBlockedActions(effect.entity, 'SECONDARY_ATTACK')
			},
		)
	},
}

export default SlownessEffect
