import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../components'
import {GameModel} from '../models/game-model'
import {afterAttack} from '../types/priorities'
import {StatusEffect, statusEffect} from './status-effect'

const PermanentSleepingEffect: StatusEffect<CardComponent> = {
	...statusEffect,
	id: 'permanent_sleeping',
	icon: 'sleeping',
	name: 'Sleep',
	description:
		'While your Hermit is sleeping, you can not attack or make your active Hermit go AFK. If sleeping Hermit is made AFK by your opponent, they wake up.',
	onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		target: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = target

		if (!target.slot.inRow()) return

		game.addBlockedActions(
			this.icon,
			'PRIMARY_ATTACK',
			'SECONDARY_ATTACK',
			'CHANGE_ACTIVE_HERMIT',
		)

		observer.subscribe(player.hooks.onTurnStart, () => {
			if (!target.slot.inRow()) return

			if (player.activeRowEntity === target.slot.row.entity) {
				game.addBlockedActions(
					this.icon,
					'PRIMARY_ATTACK',
					'SECONDARY_ATTACK',
					'CHANGE_ACTIVE_HERMIT',
				)
			}
		})

		observer.subscribeWithPriority(
			game.hooks.afterAttack,
			afterAttack.UPDATE_POST_ATTACK_STATE,
			(_attack) => {
				if (!target.isAlive()) effect.remove()
			},
		)
	},
}

export default PermanentSleepingEffect
