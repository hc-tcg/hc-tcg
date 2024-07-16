import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../components'
import {flipCoin} from '../../../utils/coinFlips'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

class LlamadadRare extends Card {
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

	override onAttach(_game: GameModel, component: CardComponent, observer: Observer) {
		const {player} = component

		player.hooks.onAttack.add(component, (attack) => {
			if (attack.isAttacker(component.entity) || attack.type !== 'secondary')
				return

			const coinFlip = flipCoin(player, component)
			if (coinFlip[0] === 'heads') {
				attack.addDamage(component.entity, 40)
			}
		})
	}

	override onDetach(_game: GameModel, component: CardComponent) {
		const {player} = component
		// Remove hooks
		player.hooks.onAttack.remove(component)
	}
}

export default LlamadadRare
