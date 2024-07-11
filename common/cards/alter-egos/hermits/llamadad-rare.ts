import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../types/game-state'
import {flipCoin} from '../../../utils/coinFlips'
import Card, {Hermit, hermit} from '../../base/card'

class LlamadadRareHermitCard extends Card {
	props: Hermit = {
		...hermit,
		id: 'llamadad_rare',
		numericId: 134,
		name: 'Llamadad',
		expansion: 'alter_egos',
		palette: 'alter_egos',
		background: 'alter_egos',
		rarity: 'rare',
		tokens: 2,
		type: 'balanced',
		health: 290,
		primary: {
			name: 'Spitz',
			cost: ['balanced'],
			damage: 50,
			power: null,
		},
		secondary: {
			name: 'Matilda',
			cost: ['balanced', 'balanced'],
			damage: 80,
			power: 'Flip a coin.\nIf heads, do an additional 40hp damage.',
		},
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player} = pos

		player.hooks.onAttack.add(component, (attack) => {
			const attacker = attack.getAttacker()
			if (attack.id !== this.getInstanceKey(component) || attack.type !== 'secondary' || !attacker)
				return

			const coinFlip = flipCoin(player, attacker.row.hermitCard)
			if (coinFlip[0] === 'heads') {
				attack.addDamage(this.props.id, 40)
			}
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = pos
		// Remove hooks
		player.hooks.onAttack.remove(component)
	}
}

export default LlamadadRareHermitCard
