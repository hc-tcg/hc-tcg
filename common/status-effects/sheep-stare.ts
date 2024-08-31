import {
	CardComponent,
	ObserverComponent,
	PlayerComponent,
	StatusEffectComponent,
} from '../components'
import {GameModel} from '../models/game-model'
import {CoinFlipResult} from '../types/game-state'
import {afterAttack, beforeAttack} from '../types/priorities'
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
		_game: GameModel,
		effect: StatusEffectComponent,
		player: PlayerComponent,
		observer: ObserverComponent,
	) {
		let coinFlipResult: CoinFlipResult | null = null

		observer.subscribeWithPriority(
			player.hooks.beforeAttack,
			beforeAttack.HERMIT_CHANGE_TARGET,
			(attack) => {
				if (!attack.isAttacker(player.getActiveHermit()?.entity)) return

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
			player.hooks.afterAttack,
			afterAttack.UPDATE_POST_ATTACK_STATE,
			() => {
				if (coinFlipResult) effect.remove()
			},
		)

		observer.subscribe(player.hooks.onTurnEnd, () => {
			effect.remove()
		})
	},
}

export default SheepStareEffect
