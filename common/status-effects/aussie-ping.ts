import {
	CardComponent,
	ObserverComponent,
	PlayerComponent,
	StatusEffectComponent,
} from '../components'
import query from '../components/query'
import {GameModel} from '../models/game-model'
import {CoinFlipResult} from '../types/game-state'
import {beforeAttack, onTurnEnd} from '../types/priorities'
import {flipCoin} from '../utils/coin-flips'
import {
	GasLightEffect,
	GasLightPotentialEffect,
	GasLightTriggeredEffect,
} from './gas-light'
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
		return (
			!player.hasStatusEffect(AussiePingImmuneEffect) &&
			!player.hasStatusEffect(AussiePingEffect)
		)
	},
	onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		player: PlayerComponent,
		observer: ObserverComponent,
	) {
		let coinFlipResult: CoinFlipResult | null = null
		let flippedHeads = false

		let gasLightRecord: Array<
			[
				gasLightEffect: StatusEffectComponent,
				target: CardComponent,
				counter: number,
			]
		> = []

		function updateGasLightRecord() {
			if (coinFlipResult === 'heads')
				gasLightRecord.forEach(([savedGasLight, savedTarget, counter]) => {
					const currentGasLight = savedTarget.getStatusEffect(
						GasLightEffect,
						GasLightTriggeredEffect,
					)
					if (!currentGasLight) return

					currentGasLight.remove()
					savedGasLight.apply(savedTarget.entity)
					if (query.effect.is(GasLightPotentialEffect)(game, savedGasLight)) {
						savedGasLight.counter = Number(
							query.effect.is(GasLightTriggeredEffect)(game, currentGasLight),
						)
					} else {
						savedGasLight.counter = counter
					}
				})
			coinFlipResult = null
			gasLightRecord = []
		}
		observer.subscribe(player.hooks.getAttackRequests, updateGasLightRecord)
		observer.subscribeWithPriority(
			player.hooks.onTurnEnd,
			onTurnEnd.BEFORE_STATUS_EFFECT_TIMEOUT,
			() => {
				if (gasLightRecord.length) {
					updateGasLightRecord()
					effect.remove()
					if (flippedHeads) {
						game.components
							.new(
								StatusEffectComponent,
								AussiePingImmuneEffect,
								effect.creator.entity,
							)
							.apply(player.entity)
					}
				}
			},
		)

		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.MODIFY_DAMAGE,
			(attack) => {
				if (attack.player.entity !== player.entity) return
				if (!attack.isType('primary', 'secondary') || attack.isBacklash) return
				if (!attack.attacker) return

				// No need to flip a coin for multiple attacks
				if (!coinFlipResult) {
					const coinFlip = flipCoin(
						game,
						player.opponentPlayer,
						effect.creator,
						1,
						player,
					)
					coinFlipResult = coinFlip[0]
					game.components
						.filter(
							StatusEffectComponent<CardComponent>,
							query.effect.is(
								GasLightEffect,
								GasLightTriggeredEffect,
								GasLightPotentialEffect,
							),
							query.effect.targetIsCardAnd(query.card.opponentPlayer),
						)
						.forEach((effect) => {
							if (effect.target.slot.inRow()) {
								gasLightRecord.push([
									effect,
									effect.target,
									effect.counter || 0,
								])
							}
						})
				}

				if (coinFlipResult === 'heads') {
					flippedHeads = true
					attack.multiplyDamage(effect.entity, 0).lockDamage(effect.entity)
				}
			},
		)

		observer.subscribeWithPriority(
			player.hooks.onTurnEnd,
			onTurnEnd.ON_STATUS_EFFECT_TIMEOUT,
			(_) => {
				effect.remove()
				if (flippedHeads) {
					game.components
						.new(
							StatusEffectComponent,
							AussiePingImmuneEffect,
							effect.creator.entity,
						)
						.apply(player.entity)
				}
			},
		)
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
