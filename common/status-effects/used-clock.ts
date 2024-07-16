import StatusEffect, {Counter, StatusEffectProps, systemStatusEffect} from './status-effect'
import {GameModel} from '../models/game-model'
import {CardComponent, ObserverComponent, StatusEffectComponent} from '../components'

class UsedClockStatusEffect extends StatusEffect {
	props: StatusEffectProps & Counter = {
		...systemStatusEffect,
		id: 'used-clock',
		name: 'Turn Skip Used',
		description: 'Turns can not be skipped consecutively.',
		counter: 1,
		counterType: 'turns',
	}

	override onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		target: CardComponent,
		observer: ObserverComponent
	) {
		const {player} = target

		if (effect.counter === null) effect.counter = this.props.counter

		observer.subscribe(player.hooks.onTurnEnd, () => {
			if (effect.counter === null) return
			if (effect.counter === 0) effect.remove()
			effect.counter--
		})

		observer.subscribe(player.hooks.onTurnStart, () => {
			if (target.slot.inRow() && target.slot.row.entity === player.activeRow?.entity)
				game.addBlockedActions(this.props.id, 'SECONDARY_ATTACK')
		})
	}
}

export default UsedClockStatusEffect
