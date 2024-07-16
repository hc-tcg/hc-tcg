import {AttackModel} from '../../../models/attack-model'
import {GameModel} from '../../../models/game-model'
import {CoinFlipT} from '../../../types/game-state'
import {applySingleUse} from '../../../utils/board'
import {flipCoin} from '../../../utils/coinFlips'
import Card from '../../base/card'
import {SingleUse} from '../../base/types'
import {singleUse} from '../../base/defaults'

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

	override onAttach(game: GameModel, component: CardComponent) {
		const {player, opponentPlayer} = pos

		let coinflipResult: CoinFlipT | null = null

		player.hooks.getAttack.add(component, () => {
			const activePos = getActiveRowPos(player)
			if (!activePos) return null
			const opponentActivePos = getActiveRowPos(opponentPlayer)
			if (!opponentActivePos) return null

			const tridentAttack = new AttackModel({
				id: this.getInstanceKey(component),
				attacker: activePos,
				target: opponentActivePos,
				type: 'effect',
				log: (values) =>
					`${values.defaultLog} to attack ${values.target} for ${values.damage} damage, then ${values.coinFlip}`,
			}).addDamage(this.props.id, 30)

			return tridentAttack
		})

		player.hooks.onAttack.add(component, (attack) => {
			const attackId = this.getInstanceKey(component)
			if (attack.id !== attackId) return

			coinflipResult = flipCoin(player, component)[0]

			applySingleUse(game)
		})

		player.hooks.onApply.add(component, () => {
			// Return to hand
			if (coinflipResult === 'heads') {
				// Reset single use card used, won't return to the hand otherwise
				player.board.singleUseCardUsed = false
				discardSingleUse(game, player)
			}
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = component

		player.hooks.getAttack.remove(component)
		player.hooks.onApply.remove(component)
		player.hooks.onAttack.remove(component)
	}
}

export default Trident
