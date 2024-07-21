import {CardComponent, ObserverComponent, StatusEffectComponent} from '../components'
import {CardStatusEffect, StatusEffectProps, systemStatusEffect} from './status-effect'
import {GameModel} from '../models/game-model'
import {CoinFlipResult} from '../types/game-state'
import {flipCoin} from '../utils/coinFlips'

export class AussiePingEffect extends CardStatusEffect {
	props: StatusEffectProps = {
		...systemStatusEffect,
		icon: 'aussie-ping',
		name: 'Weak Connection',
		description:
			'When your opponent attacks, flip a coin. If heads, that attack misses. Lasts until they attack or the end of the turn.',
		applyCondition: (_game, card) => {
			if (!(card instanceof CardComponent)) return false
			return !card.hasStatusEffect(AussiePingImmuneEffect)
		},
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

			if (coinFlipResult === 'heads') {
				attack.multiplyDamage(effect.entity, 0).lockDamage(effect.entity)
			}
		})

		observer.subscribe(opponentPlayer.hooks.afterAttack, () => {
			if (!coinFlipResult) return
			effect.remove()
			if (coinFlipResult === 'heads') {
				game.components.new(StatusEffectComponent, AussiePingImmuneEffect).apply(target.entity)
			}
		})

		observer.subscribe(opponentPlayer.hooks.onTurnEnd, (_) => {
			effect.remove()
			if (coinFlipResult === 'heads') {
				game.components.new(StatusEffectComponent, AussiePingImmuneEffect).apply(target.entity)
			}
		})
	}
}

export class AussiePingImmuneEffect extends CardStatusEffect {
	props: StatusEffectProps = {
		...systemStatusEffect,
		icon: 'aussie-ping-immune',
		name: 'Strong Connection',
		description: 'This Hermit can not cause your opponent to miss with Aussie Ping this turn.',
	}

	override onApply(
		_game: GameModel,
		effect: StatusEffectComponent,
		target: CardComponent,
		observer: ObserverComponent
	) {
		observer.subscribe(target.opponentPlayer.hooks.onTurnStart, () => {
			effect.remove()
		})
	}
}
