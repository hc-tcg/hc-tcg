import {
	CardComponent,
	PlayerComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../components'
import query from '../components/query'
import {GameModel} from '../models/game-model'
import {beforeAttack} from '../types/priorities'
import {Counter, statusEffect} from './status-effect'

const WeaknessEffect: Counter<PlayerComponent> = {
	...statusEffect,
	id: 'weakness',
	icon: 'weakness',
	name: 'Weakness',
	description: "[weakType] is weak to [strongType] for the duration fo this counter.",
	counter: 3,
	counterType: 'turns',
	onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		target: PlayerComponent,
		observer: ObserverComponent,
	) {
		const player = target
		const {opponentPlayer} = target
		const weakType = player.getActiveHermit()?.entity.type
		const strongType = opponentPlayer.getActiveHermit()?.entity.type

		if (!effect.counter) effect.counter = this.counter

		observer.subscribe(player.hooks.onTurnStart, () => {
			if (!effect.counter) return
			effect.counter--

			if (effect.counter === 0) effect.remove()
		})

		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.FORCE_WEAKNESS_ATTACK,
			(attack) => {
				const targetCardInfo = game.components.find(
					CardComponent,
					query.card.rowEntity(attack.targetEntity),
					query.card.isHermit,
				)

				if (attack.createWeakness === 'never') return

				if (
					targetCardInfo?.props.type !== weakType ||
					attack.attacker?.props.type !== strongType
				) return

				attack.createWeakness = 'always'
			},
		)
	},
}

export default WeaknessEffect
