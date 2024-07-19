import {ObserverComponent, PlayerComponent, StatusEffectComponent} from '../components'
import {PlayerStatusEffect, StatusEffectProps, systemStatusEffect} from './status-effect'
import {GameModel} from '../models/game-model'
import {CoinFlipResult} from '../types/game-state'
import {flipCoin} from '../utils/coinFlips'

export class AussiePingEffect extends PlayerStatusEffect {
	props: StatusEffectProps = {
		...systemStatusEffect,
		icon: 'aussie-ping',
		name: 'Weak Connection',
		description:
			'When this hermit attacks, flip a coin. If heads, this hermit misses. Lasts until this hermit attacks or the end of the turn.',
		applyCondition: (_game, player) => {
			if (!(player instanceof PlayerComponent)) return false
			return !player.hasStatusEffect(AussiePingImmuneEffect)
		},
	}

	override onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		player: PlayerComponent,
		observer: ObserverComponent
	) {
		let coinFlipResult: CoinFlipResult | null = null

		observer.subscribe(player.hooks.beforeAttack, (attack) => {
			if (!attack.isType('primary', 'secondary') || attack.isBacklash) return
			if (!attack.attacker) return

			const activeHermit = player.opponentPlayer.activeRow?.getHermit()
			if (!activeHermit) return

			// No need to flip a coin for multiple attacks
			if (!coinFlipResult) {
				const coinFlip = flipCoin(player, activeHermit)
				coinFlipResult = coinFlip[0]
			}

			if (coinFlipResult === 'heads') {
				attack.multiplyDamage(effect.entity, 0).lockDamage(effect.entity)
			}
		})

		observer.subscribe(player.hooks.afterAttack, () => {
			effect.remove()
			if (coinFlipResult === 'heads') {
				game.components.new(StatusEffectComponent, AussiePingImmuneEffect).apply(player.entity)
			}
		})

		observer.subscribe(player.hooks.onTurnEnd, (_) => {
			effect.remove()
			if (coinFlipResult === 'heads') {
				game.components.new(StatusEffectComponent, AussiePingImmuneEffect).apply(player.entity)
			}
		})
	}
}

export class AussiePingImmuneEffect extends PlayerStatusEffect {
	props: StatusEffectProps = {
		...systemStatusEffect,
		icon: 'aussie-ping-immune',
		name: 'Strong Connection',
		description: 'This Hermit cannot miss due to Aussie Ping.',
	}

	override onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		player: PlayerComponent,
		observer: ObserverComponent
	) {
		observer.subscribe(player.hooks.onTurnStart, () => {
			effect.remove()
		})
	}
}
