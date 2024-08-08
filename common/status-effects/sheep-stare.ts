import {
	CardComponent,
	ObserverComponent,
	PlayerComponent,
	StatusEffectComponent,
} from '../components'
import {GameModel} from '../models/game-model'
import {CoinFlipResult} from '../types/game-state'
import {flipCoin} from '../utils/coinFlips'
import {
	PlayerStatusEffect,
	StatusEffect,
	systemStatusEffect,
} from './status-effect'

class SheepStareEffect extends PlayerStatusEffect {
	props: StatusEffect = {
		...systemStatusEffect,
		icon: 'sheep-stare',
		name: 'Sheep Stare',
		description:
			'When you attack, flip a coin. If heads, the attacking hermit attacks themselves. Lasts until you attack or the end of the turn.',
	}

	override onApply(
		_game: GameModel,
		effect: StatusEffectComponent,
		player: PlayerComponent,
		observer: ObserverComponent,
	) {
		let coinFlipResult: CoinFlipResult | null = null
		const activeHermit = player.getActiveHermit()

		observer.subscribe(player.hooks.beforeAttack, (attack) => {
			if (!attack.isAttacker(activeHermit?.entity)) return

			// No need to flip a coin for multiple attacks
			if (!coinFlipResult) {
				if (!activeHermit) return
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
		})

		observer.subscribe(player.hooks.afterAttack, () => {
			if (coinFlipResult) effect.remove()
		})

		observer.subscribe(player.hooks.onTurnEnd, () => {
			effect.remove()
		})
	}
}

export default SheepStareEffect
