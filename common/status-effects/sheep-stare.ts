import {PlayerStatusEffect, StatusEffectProps, systemStatusEffect} from './status-effect'
import {GameModel} from '../models/game-model'
import {CoinFlipT} from '../types/game-state'
import {flipCoin} from '../utils/coinFlips'
import {
	CardComponent,
	ObserverComponent,
	PlayerComponent,
	RowComponent,
	StatusEffectComponent,
} from '../components'
import {row} from '../components/query'

class SheepStare extends PlayerStatusEffect {
	props: StatusEffectProps = {
		...systemStatusEffect,
		id: 'sheep-stare',
		name: 'Sheep Stare',
		description:
			'When this hermit attacks, flip a coin. If heads, this hermit attacks themselves. Lasts until this hermit attacks or the end of the turn.',
	}

	override onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		player: PlayerComponent,
		observer: ObserverComponent
	) {
		let coinFlipResult: CoinFlipT | null = null

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

export default SheepStare
