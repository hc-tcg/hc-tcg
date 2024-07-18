import {GameModel} from '../../../models/game-model'
import {CoinFlipT} from '../../../types/game-state'
import {applySingleUse} from '../../../utils/board'
import {flipCoin} from '../../../utils/coinFlips'
import Card from '../../base/card'
import {SingleUse} from '../../base/types'
import {singleUse} from '../../base/defaults'
import {CardComponent, ObserverComponent} from '../../../components'

class Trident extends Card {
	props: SingleUse = {
		...singleUse,
		id: 'trident',
		numericId: 150,
		name: 'Trident',
		expansion: 'alter_egos',
		rarity: 'rare',
		tokens: 2,
		description:
			"Do 30hp damage to your opponent's active Hermit.\nFlip a coin.\nIf heads, this card is returned to your hand.",
		hasAttack: true,
	}

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player, opponentPlayer} = component

		let coinflipResult: CoinFlipT | null = null

		observer.subscribe(player.hooks.getAttack, () => {
			return game
				.newAttack({
					attacker: component.entity,
					target: opponentPlayer.activeRowEntity,
					type: 'effect',
					log: (values) =>
						`${values.defaultLog} to attack ${values.target} for ${values.damage} damage`,
				})
				.addDamage(component.entity, 20)
		})

		observer.subscribe(player.hooks.onAttack, (attack) => {
			if (!attack.isAttacker(component.entity)) return
			applySingleUse(game)
		})

		observer.subscribe(player.hooks.onAttack, (attack) => {
			if (!attack.isAttacker(component.entity)) return

			coinflipResult = flipCoin(player, component)[0]

			applySingleUse(game)
		})

		observer.subscribe(player.hooks.onApply, () => {
			if (coinflipResult === 'heads') {
				component.draw()
			}
		})
	}
}

export default Trident
