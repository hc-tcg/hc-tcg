import {GameModel} from '../../../models/game-model'
import {flipCoin} from '../../../utils/coinFlips'
import {applyStatusEffect} from '../../../utils/board'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'
import {CardComponent} from '../../../components'

class EthosLabRareHermitCard extends Card {
	props: Hermit = {
		...hermit,
		id: 'ethoslab_rare',
		numericId: 20,
		name: 'Etho',
		expansion: 'default',
		rarity: 'rare',
		tokens: 3,
		type: 'redstone',
		health: 280,
		primary: {
			name: 'Oh Snappers',
			cost: ['redstone'],
			damage: 50,
			power: null,
		},
		secondary: {
			name: 'Blue Fire',
			cost: ['redstone', 'redstone'],
			damage: 80,
			power: "Flip a coin.\nIf heads, burn your opponent's active Hermit.",
		},
		sidebarDescriptions: [
			{
				type: 'statusEffect',
				name: 'fire',
			},
		],
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player, opponentPlayer} = pos

		player.hooks.onAttack.add(component, (attack) => {
			const attacker = attack.getAttacker()
			const attackId = this.getInstanceKey(component)
			if (attack.id !== attackId || attack.type !== 'secondary' || !attack.getTarget() || !attacker)
				return

			const coinFlip = flipCoin(player, attacker.row.hermitCard)

			if (coinFlip[0] !== 'heads') return

			const opponentActiveRow = getActiveRow(opponentPlayer)
			if (!opponentActiveRow || !opponentActiveRow.hermitCard) return

			applyStatusEffect(game, 'fire', opponentActiveRow?.hermitCard)
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = component
		// Remove hooks
		player.hooks.onAttack.remove(component)
	}
}

export default EthosLabRareHermitCard
