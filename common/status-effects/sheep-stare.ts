import {
	CardComponent,
	ObserverComponent,
	PlayerComponent,
	StatusEffectComponent,
} from '../components'
import {GameModel} from '../models/game-model'
import {CoinFlipResult} from '../types/game-state'
import {afterAttack, beforeAttack, onTurnEnd} from '../types/priorities'
import {flipCoin} from '../utils/coinFlips'
import {StatusEffect, systemStatusEffect} from './status-effect'

const SheepStareEffect: StatusEffect<PlayerComponent> = {
	...systemStatusEffect,
	id: 'sheep-stare',
	icon: 'sheep-stare',
	name: 'Sheep Stare',
	description:
		'When you attack, flip a coin. If heads, the attacking hermit attacks themselves. Lasts until you attack or the end of the turn.',
	onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		player: PlayerComponent,
		observer: ObserverComponent,
	) {
		let coinFlipResult: CoinFlipResult | null = null

		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.HERMIT_CHANGE_TARGET,
			(attack) => {
				if (attack.player.entity !== player.entity) return
				if (!attack.isAttacker(player.getActiveHermit()?.entity)) return

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
				}

				if (
					!(attack.attacker instanceof CardComponent) ||
					!attack.attacker.slot.inRow()
				)
					return

				if (coinFlipResult === 'heads') {
					attack.setTarget(effect.entity, attack.attacker.slot.rowEntity)
				}
			},
		)

		observer.subscribeWithPriority(
			game.hooks.afterAttack,
			afterAttack.UPDATE_POST_ATTACK_STATE,
			(attack) => {
				if (attack.player.entity !== player.entity) return
				if (coinFlipResult) effect.remove()
			},
		)

		observer.subscribeWithPriority(
			player.hooks.onTurnEnd,
			onTurnEnd.ON_STATUS_EFFECT_TIMEOUT,
			() => {
				effect.remove()
			},
		)
	},
}

export default SheepStareEffect
