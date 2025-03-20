import {
	CardComponent,
	ObserverComponent,
	PlayerComponent,
	StatusEffectComponent,
} from '../components'
import {GameModel} from '../models/game-model'
import {beforeAttack} from '../types/priorities'
import {Counter, systemStatusEffect} from './status-effect'

const WeaknessEffect: Counter<PlayerComponent> = {
	...systemStatusEffect,
	id: 'weakness',
	icon: 'weakness',
	name: 'Weakness',
	description:
		'[weakType] is weak to [strongType] for the duration fo this counter.',
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

		const playerActive = player.getActiveHermit()
		const opponentActive = opponentPlayer.getActiveHermit()

		if (!playerActive?.isHermit() || !opponentActive?.isHermit()) return

		const weakType = playerActive.props.type
		const strongType = opponentActive.props.type
		function capitalize(s: string) {
			return s[0].toUpperCase() + s.slice(1)
		}

		effect.description =
			capitalize(weakType) +
			' type is weak to ' +
			capitalize(strongType) +
			' type for the duration of this counter.'

		observer.subscribe(opponentPlayer.hooks.onTurnStart, () => {
			if (!effect.counter) return
			effect.counter--

			if (effect.counter === 0) effect.remove()
		})

		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.FORCE_WEAKNESS_ATTACK,
			(attack) => {
				const targetCardInfo = attack.target?.getHermit()
				if (!(attack.attacker instanceof CardComponent)) return
				if (!attack.attacker.isHermit() || !targetCardInfo?.isHermit()) return

				if (attack.createWeakness === 'never') return

				if (
					targetCardInfo.props.type == weakType &&
					attack.attacker.props.type == strongType
				) {
					attack.createWeakness = 'always'
				}
			},
		)
	},
}

export default WeaknessEffect
