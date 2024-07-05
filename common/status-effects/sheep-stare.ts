import StatusEffect, {StatusEffectProps, statusEffect} from './status-effect'
import {GameModel} from '../models/game-model'
import {CardPosModel} from '../models/card-pos-model'
import {CoinFlipT, StatusEffectInstance} from '../types/game-state'
import {flipCoin} from '../utils/coinFlips'
import {attach} from '../cards/base/card'
import {removeStatusEffect} from '../utils/board'

class SheepStareEffect extends StatusEffect {
	props: StatusEffectProps = {
		...statusEffect,
		id: 'sheep-stare',
		name: 'Sheep Stare',
		description: 'When this hermit attacks, flip a coin. If heads, this hermit attacks themselves.',
		damageEffect: false,
	}

	override onApply(game: GameModel, instance: StatusEffectInstance, pos: CardPosModel) {
		let {player} = pos

		let coinFlipResult: CoinFlipT | null = null

		player.hooks.beforeAttack.add(instance, (attack) => {
			if (!attack.isType('primary', 'secondary') || attack.isBacklash) return
			if (!attack.getAttacker()) return

			// No need to flip a coin for multiple attacks
			if (!coinFlipResult) {
				const coinFlip = flipCoin(player, instance.targetInstance)
				coinFlipResult = coinFlip[0]
			}

			if (coinFlipResult === 'heads') {
				// Change attack target - this just works
				attack.setTarget(this.props.id, attack.getAttacker())
			}
		})

		player.hooks.afterAttack.add(instance, (attack) => {
			removeStatusEffect(game, pos, instance)
		})
	}

	override onRemoval(game: GameModel, instance: StatusEffectInstance, pos: CardPosModel) {
		const {player} = pos

		player.hooks.beforeAttack.remove(instance)
		player.hooks.afterAttack.remove(instance)
	}
}

export default SheepStareEffect
