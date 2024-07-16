import {GameModel} from '../../../models/game-model'
import {flipCoin} from '../../../utils/coinFlips'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'
import {CardComponent} from '../../../components'

class XisumavoidRareHermitCard extends Card {
	props: Hermit = {
		...hermit,
		id: 'xisumavoid_rare',
		numericId: 112,
		name: 'Xisuma',
		expansion: 'default',
		rarity: 'rare',
		tokens: 2,
		type: 'redstone',
		health: 280,
		primary: {
			name: 'Goodness Me',
			cost: ['redstone'],
			damage: 60,
			power: null,
		},
		secondary: {
			name: 'Cup of Tea',
			cost: ['redstone', 'redstone'],
			damage: 80,
			power: "Flip a coin.\nIf heads, poison your opponent's active Hermit.",
		},
		sidebarDescriptions: [
			{
				type: 'statusEffect',
				name: 'poison',
			},
		],
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player, opponentPlayer} = pos

		player.hooks.onAttack.add(component, (attack) => {
			const attackId = this.getInstanceKey(component)
			const attacker = attack.getAttacker()
			if (attack.id !== attackId || attack.type !== 'secondary' || !attack.getTarget() || !attacker)
				return

			const coinFlip = flipCoin(player, attacker.row.hermitCard)

			if (coinFlip[0] !== 'heads') return

			const opponentActiveRow = getActiveRow(opponentPlayer)
			if (!opponentActiveRow || !opponentActiveRow.hermitCard) return

			applyStatusEffect(game, 'poison', opponentActiveRow?.hermitCard)
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = component
		// Remove hooks
		player.hooks.onAttack.remove(component)
	}
}

export default XisumavoidRareHermitCard
