import {
	CardComponent,
	ObserverComponent,
	PlayerComponent,
	StatusEffectComponent,
} from '../components'
import query from '../components/query'
import {GameModel} from '../models/game-model'
import {beforeAttack, onTurnEnd} from '../types/priorities'
import {flipCoin} from '../utils/coinFlips'
import {StatusEffect, systemStatusEffect} from './status-effect'

const SheepStareEffect: StatusEffect<PlayerComponent> = {
	...systemStatusEffect,
	id: 'sheep-stare',
	icon: 'sheep-stare',
	name: 'Sheep Stare',
	description:
		'When you attack, flip a coin. If heads, the attacking hermit attacks themselves. Lasts until the end of the turn.',
	onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		player: PlayerComponent,
		observer: ObserverComponent,
	) {
		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.SHEEP_STARE_CHANGE_TARGET,
			(attack) => {
				if (attack.player.entity !== player.entity) return
				if (!attack.isAttacker(player.getActiveHermit()?.entity)) return

				if (
					!(attack.attacker instanceof CardComponent) ||
					!attack.attacker.slot.inRow()
				)
					return
				if (query.some(...attack.shouldIgnoreCards)(game, attack.attacker))
					return

				const coinFlip = flipCoin(
					player.opponentPlayer,
					effect.creator,
					1,
					player,
				)[0]
				if (coinFlip === 'heads') {
					attack.setTarget(effect.entity, attack.attacker.slot.rowEntity)
				}
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
