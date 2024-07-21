import {CardStatusEffect, StatusEffectProps, systemStatusEffect} from './status-effect'
import {GameModel} from '../models/game-model'
import {CoinFlipResult} from '../types/game-state'
import {flipCoin} from '../utils/coinFlips'
import {
	CardComponent,
	ObserverComponent,
	PlayerComponent,
	StatusEffectComponent,
} from '../components'

class SheepStareEffect extends CardStatusEffect {
	props: StatusEffectProps = {
		...systemStatusEffect,
		icon: 'sheep-stare',
		name: 'Sheep Stare',
		description:
			'When your opponent attacks, flip a coin. If heads, the attacking hermit attacks themselves. Lasts until they attack or the end of the turn.',
	}

	override onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		target: CardComponent,
		observer: ObserverComponent
	) {
		let coinFlipResult: CoinFlipResult | null = null

		const opponentPlayer = target.opponentPlayer

		observer.subscribe(opponentPlayer.hooks.beforeAttack, (attack) => {
			if (!attack.isType('primary', 'secondary') || attack.isBacklash) return
			if (!attack.attacker) return

			// No need to flip a coin for multiple attacks
			if (!coinFlipResult) {
				const coinFlip = flipCoin(target.player, target, 1, opponentPlayer)
				coinFlipResult = coinFlip[0]
			}

			if (!(attack.attacker instanceof CardComponent) || !attack.attacker.slot.inRow()) return

			if (coinFlipResult === 'heads') {
				attack.setTarget(effect.entity, attack.attacker.slot.rowEntity)
			}
		})

		observer.subscribe(opponentPlayer.hooks.afterAttack, () => {
			if (coinFlipResult) effect.remove()
		})

		observer.subscribe(opponentPlayer.hooks.onTurnEnd, () => {
			effect.remove()
		})
	}
}

export default SheepStareEffect
