import StatusEffect, {
	StatusEffectProps,
	// followActiveHermit,
	systemStatusEffect,
} from './status-effect'
import {GameModel} from '../models/game-model'
import {CoinFlipT} from '../types/game-state'
import {flipCoin} from '../utils/coinFlips'

class SheepStare extends StatusEffect {
	props: StatusEffectProps = {
		...systemStatusEffect,
		id: 'sheep-stare',
		name: 'Sheep Stare',
		description:
			'When this hermit attacks, flip a coin. If heads, this hermit attacks themselves. Lasts until this hermit attacks or the end of the turn.',
	}

	override onApply(game: GameModel, instance: StatusEffectComponent, pos: CardPosModel) {
		let {player} = pos

		let coinFlipResult: CoinFlipT | null = null

		player.hooks.beforeAttack.add(instance, (attack) => {
			if (!attack.isType('primary', 'secondary') || attack.isBacklash) return
			if (!attack.getAttacker()) return

			// No need to flip a coin for multiple attacks
			if (!coinFlipResult) {
				const coinFlip = flipCoin(player, instance.target)
				coinFlipResult = coinFlip[0]
			}

			if (coinFlipResult === 'heads') {
				attack.setTarget(this.props.id, attack.getAttacker())
			}
		})

		player.hooks.afterAttack.add(instance, (_) => {
			removeStatusEffect(game, pos, instance)
		})

		player.hooks.onTurnEnd.add(instance, (_) => {
			removeStatusEffect(game, pos, instance)
		})

		player.hooks.onActiveRowChange.add(instance, followActiveHermit(game, instance))
	}

	override onRemoval(game: GameModel, instance: StatusEffectComponent, pos: CardPosModel) {
		const {player} = component

		player.hooks.beforeAttack.remove(instance)
		player.hooks.afterAttack.remove(instance)
		player.hooks.onActiveRowChange.remove(instance)
		player.hooks.onTurnEnd.remove(instance)
	}
}

export default SheepStare
