import {
	ObserverComponent,
	PlayerComponent,
	StatusEffectComponent,
} from '../components'
import {GameModel} from '../models/game-model'
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

		if (!playerActive.props.type || !opponentActive.props.type) {
			effect.remove()
			return
		}

		const weakTypes = playerActive.props.type
		const strongTypes = opponentActive.props.type

		effect.extraInfo = {
			weak: weakTypes,
			strong: strongTypes,
		}

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
			if ((i = weakTypes.length - 1)) weakString += 'and '
			weakString += capitalize(weakTypes[i])
		}
		for (i = 0; i < strongTypes.length; i++) {
			if (i > 0) strongString += ', '
			if ((i = strongTypes.length - 1)) strongString += 'and '
			strongString += capitalize(strongTypes[i])
		}

		if (weakTypes.length > 1) weaktype = ' types are '
		if (strongTypes.length > 1) strongtype = ' types '

		effect.description =
			weakString +
			weaktype +
			'weak to ' +
			strongString +
			strongtype +
			'for the duration fo this counter.'

		observer.subscribe(opponentPlayer.hooks.onTurnStart, () => {
			if (!effect.counter) return
			effect.counter--

			if (effect.counter === 0) effect.remove()
		})
	},
}

export default WeaknessEffect
