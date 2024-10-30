import {
	CardComponent,
	ObserverComponent,
	PlayerComponent,
	StatusEffectComponent,
} from '../components'
import {GameModel} from '../models/game-model'
import {beforeAttack} from '../types/priorities'
import {Counter, statusEffect} from './status-effect'

const WeaknessEffect: Counter<PlayerComponent> = {
	...statusEffect,
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

		if (!playerActive.props.type || !opponentActive.props.type) effect.remove()
		if (!playerActive.props.type || !opponentActive.props.type) return

		const weakTypes = playerActive.props.type
		const strongTypes = opponentActive.props.type
		function capitalize(s: string) {
			return s[0].toUpperCase() + s.slice(1)
		}

		let weakString = ''
		let strongString = ''

		let weaktype = ' type is '
		let strongtype = ' type '

		let i
		for (i = 0; i < weakTypes.length; i++) {
			if (i > 0) weakString += ', '
			if (i = weakTypes.length - 1) weakString += 'and '
			weakString += capitalize(weakTypes[i])
		}
		for (i = 0; i < strongTypes.length; i++) {
			if (i > 0) strongString += ', '
			if (i = strongTypes.length - 1) strongString += 'and '
			strongString += capitalize(strongTypes[i])
		}

		if (weakTypes.length > 1) weaktype = ' types are '
		if (strongTypes.length > 1) strongtype = ' types '

		effect.description =
			weakString + weaktype + 'weak to ' + strongString + strongtype + 'for the duration fo this counter.'

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
					attack.createWeakness = 'always' // Still needs editing here.
				}
			},
		)
	},
}

export default WeaknessEffect
