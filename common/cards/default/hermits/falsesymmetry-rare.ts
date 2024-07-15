import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../components'
import {flipCoin} from '../../../utils/coinFlips'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

class FalseSymmetryRareHermitCard extends Card {
	props: Hermit = {
		...hermit,
		id: 'falsesymmetry_rare',
		numericId: 23,
		name: 'False',
		expansion: 'default',
		rarity: 'rare',
		tokens: 1,
		type: 'builder',
		health: 250,
		primary: {
			name: 'High Noon',
			cost: ['builder'],
			damage: 60,
			power: null,
		},
		secondary: {
			name: 'Supremacy',
			cost: ['builder', 'any'],
			damage: 70,
			power: 'Flip a coin.\nIf heads, heal this Hermit 40hp.',
		},
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player} = component

		player.hooks.onAttack.add(component, (attack) => {
			if (
				!attack.isTargetting(component) ||
				attack.type !== 'secondary' ||
				!(attack.attacker instanceof CardComponent)
			)
				return

			const coinFlip = flipCoin(player, attack.attacker)

			if (coinFlip[0] === 'tails') return

			// Heal 40hp
			component.slot.inRow() && component.slot.row.heal(40)
			game.battleLog.addEntry(player.entity, `$p${this.props.name}$ healed $g40hp$`)
		})
	}

	override onDetach(_game: GameModel, component: CardComponent) {
		const {player} = component
		// Remove hooks
		player.hooks.onAttack.remove(component)
	}
}

export default FalseSymmetryRareHermitCard
