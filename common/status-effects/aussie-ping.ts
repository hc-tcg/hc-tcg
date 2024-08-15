import {
	ObserverComponent,
	PlayerComponent,
	StatusEffectComponent,
} from '../components'
import {GameModel} from '../models/game-model'
import {CoinFlipResult} from '../types/game-state'
import {flipCoin} from '../utils/coinFlips'
import {StatusEffect, systemStatusEffect} from './status-effect'

export const AussiePingEffect: StatusEffect<PlayerComponent> = {
	...systemStatusEffect,
	id: 'aussie-ping',
	icon: 'aussie-ping',
	name: 'Weak Connection',
	description:
		'When you attack, flip a coin. If heads, this attack misses. Lasts until you attack or the end of the turn.',
	applyCondition: (_game, player) => {
		if (!(player instanceof PlayerComponent)) return false
		return !player.hasStatusEffect(AussiePingImmuneEffect)
	},
	onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		player: PlayerComponent,
		observer: ObserverComponent,
	) {
		let coinFlipResult: CoinFlipResult | null = null

		observer.subscribe(player.hooks.beforeAttack, (attack) => {
			if (!attack.isType('primary', 'secondary') || attack.isBacklash) return
			if (!attack.attacker) return

			// No need to flip a coin for multiple attacks
			if (!coinFlipResult) {
				const coinFlip = flipCoin(
					player.opponentPlayer,
					effect.creator,
					1,
					player,
				)
				coinFlipResult = coinFlip[0]
			}

			if (coinFlipResult === 'heads') {
				attack.multiplyDamage(effect.entity, 0).lockDamage(effect.entity)
			}
		})

		observer.subscribe(player.hooks.afterAttack, () => {
			if (!coinFlipResult) return
			effect.remove()
			if (coinFlipResult === 'heads') {
				game.components
					.new(
						StatusEffectComponent,
						AussiePingImmuneEffect,
						effect.creator.entity,
					)
					.apply(player.entity)
			}
		})

		observer.subscribe(player.hooks.onTurnEnd, (_) => {
			effect.remove()
			if (coinFlipResult === 'heads') {
				game.components
					.new(
						StatusEffectComponent,
						AussiePingImmuneEffect,
						effect.creator.entity,
					)
					.apply(player.entity)
			}
		})
	},
}

export const AussiePingImmuneEffect: StatusEffect<PlayerComponent> = {
	...systemStatusEffect,
	id: 'aussie-ping-immune',
	icon: 'aussie-ping-immune',
	name: 'Strong Connection',
	description: 'You are immune to Aussie Ping for the duration of this turn.',
	onApply(
		_game: GameModel,
		effect: StatusEffectComponent,
		player: PlayerComponent,
		observer: ObserverComponent,
	) {
		observer.subscribe(player.hooks.onTurnStart, () => {
			effect.remove()
		})
	},
}
