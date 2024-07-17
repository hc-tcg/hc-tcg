import {StatusEffectProps, Counter, statusEffect, CardStatusEffect} from './status-effect'
import {GameModel} from '../models/game-model'
import {CardComponent, ObserverComponent, StatusEffectComponent} from '../components'

class SleepingEffect extends CardStatusEffect {
	props: StatusEffectProps & Counter = {
		...statusEffect,
		id: 'sleeping',
		name: 'Sleep',
		description:
			'While your Hermit is sleeping, you can not attack or make your active Hermit go AFK. If sleeping Hermit is made AFK by your opponent, they wake up.',
		counter: 3,
		counterType: 'turns',
	}

	override onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		target: CardComponent,
		observer: ObserverComponent
	) {
		const {player} = target

		effect.counter = this.props.counter

		if (!target.slot.inRow()) return
		if (!target.isHealth()) return

		game.addBlockedActions(
			this.props.id,
			'PRIMARY_ATTACK',
			'SECONDARY_ATTACK',
			'CHANGE_ACTIVE_HERMIT'
		)

		target.slot.row.heal(target.props.health)

		game.battleLog.addEntry(
			player.entity,
			`$p${target.props.name}$ went to $eSleep$ and restored $gfull health$`
		)

		observer.subscribe(player.hooks.onTurnStart, () => {
			if (effect.counter !== null) effect.counter--
			if (!target.slot.inRow()) return

			if (effect.counter === 0) {
				effect.remove()
				return
			}

			if (player.activeRowEntity === target.slot.row.entity) {
				game.addBlockedActions(
					this.props.id,
					'PRIMARY_ATTACK',
					'SECONDARY_ATTACK',
					'CHANGE_ACTIVE_HERMIT'
				)
			}
		})

		observer.subscribe(player.hooks.afterDefence, (_attack) => {
			if (!target.isAlive()) effect.remove()
		})
	}
}

export default SleepingEffect
