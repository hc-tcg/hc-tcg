import {GameModel} from '../../../models/game-model'
import {slot} from '../../../components/query'
import {CardComponent} from '../../../components'
import {flipCoin} from '../../../utils/coinFlips'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

class TinFoilChefUltraRare extends Card {
	props: Hermit = {
		...hermit,
		id: 'tinfoilchef_ultra_rare',
		numericId: 99,
		name: 'TFC',
		expansion: 'default',
		rarity: 'ultra_rare',
		tokens: 2,
		type: 'miner',
		health: 300,
		primary: {
			name: 'Phone Call',
			cost: ['miner'],
			damage: 60,
			power: null,
		},
		secondary: {
			name: 'Take It Easy',
			cost: ['miner', 'miner', 'miner'],
			damage: 100,
			power:
				'Flip a coin.\nIf heads, your opponent must discard any effect card attached to their active Hermit.\nOnly one effect card per Hermit can be discarded using this ability.',
		},
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player, opponentPlayer} = pos

		let hasDiscardedFrom = new Set<string>()

		player.hooks.beforeAttack.add(component, (attack) => {
			const attackId = this.getInstanceKey(component)
			const attacker = attack.getAttacker()
			if (attack.id !== attackId || attack.type !== 'secondary' || !attacker) return

			if (opponentPlayer.board.activeRow === null) return 'NO'
			const opponentActiveRow = opponentPlayer.board.rows[opponentPlayer.board.activeRow]
			if (!opponentActiveRow.effectCard) return
			if (!slot.someSlotFulfills(slot.every(slot.opponent, slot.attachSlot, slot.not(slot.frozen))))
				return

			// Can't discard two items on the same hermit
			if (hasDiscardedFrom.has(opponentActiveRow.hermitCard.component)) return

			const coinFlip = flipCoin(player, attacker.row.hermitCard)
			if (coinFlip[0] === 'tails') return

			hasDiscardedFrom.add(opponentActiveRow.hermitCard.component)

			discardCard(game, opponentActiveRow.effectCard)
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = component

		player.hooks.beforeAttack.remove(component)
	}
}

export default TinFoilChefUltraRare
