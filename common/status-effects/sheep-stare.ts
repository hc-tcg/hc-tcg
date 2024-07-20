import {PlayerStatusEffect, StatusEffectProps, systemStatusEffect} from './status-effect'
import {GameModel} from '../models/game-model'
import {CoinFlipResult} from '../types/game-state'
import {flipCoin} from '../utils/coinFlips'
import {
	CardComponent,
	ObserverComponent,
	PlayerComponent,
	StatusEffectComponent,
} from '../components'

class SheepStareEffect extends PlayerStatusEffect {
	props: StatusEffectProps = {
		...systemStatusEffect,
		icon: 'sheep-stare',
		name: 'Sheep Stare',
		description:
			'When you attack, flip a coin. If heads, the attacking hermit attacks themselves. Lasts until you attack or the end of the turn.',
	}

	override onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		player: PlayerComponent,
		observer: ObserverComponent
	) {
		let coinFlipResult: CoinFlipResult | null = null

		observer.subscribe(player.hooks.beforeAttack, (attack) => {
			if (attack.attacker?.entity !== effect.targetEntity) return
			if (attack.type !== 'primary') return

			const activeHermit = player.activeRow?.getHermit()
			if (!activeHermit) return

			// No need to flip a coin for multiple attacks
			if (!coinFlipResult) {
				const coinFlip = flipCoin(player, activeHermit)
				coinFlipResult = coinFlip[0]
			}

			if (!(attack.attacker instanceof CardComponent) || !attack.attacker.slot.inRow()) return

			if (coinFlipResult === 'heads') {
				attack.setTarget(effect.entity, attack.attacker.slot.rowEntity)
			}
		})

		observer.subscribe(player.hooks.afterAttack, () => {
			effect.remove()
		})

		observer.subscribe(player.hooks.onTurnEnd, () => {
			effect.remove()
		})
	}
}

export default SheepStareEffect
