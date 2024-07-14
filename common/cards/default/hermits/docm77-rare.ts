import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../components'
import {flipCoin} from '../../../utils/coinFlips'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

class Docm77RareHermitCard extends Card {
	props: Hermit = {
		...hermit,
		id: 'docm77_rare',
		numericId: 16,
		name: 'Docm77',
		expansion: 'default',
		rarity: 'rare',
		tokens: 2,
		type: 'farm',
		health: 280,
		primary: {
			name: 'Shadow Tech',
			cost: ['any'],
			damage: 40,
			power: null,
		},
		secondary: {
			name: 'World Eater',
			cost: ['farm', 'farm'],
			damage: 80,
			power: 'Flip a Coin.\nIf heads, attack damage doubles.\nIf tails, attack damage is halved.',
		},
	}

	override onAttach(_game: GameModel, component: CardComponent) {
		const {player} = component

		player.hooks.onAttack.add(component, (attack) => {
			if (attack.attacker?.entity !== component.entity || attack.type !== 'secondary') return
			if (!(attack.attacker instanceof CardComponent)) return

			const coinFlip = flipCoin(player, attack.attacker)

			if (coinFlip[0] === 'heads') {
				attack.addDamage(component.entity, this.props.secondary.damage)
			} else {
				attack.reduceDamage(component.entity, this.props.secondary.damage / 2)
			}
		})
	}

	override onDetach(_game: GameModel, component: CardComponent) {
		const {player} = component
		// Remove hooks
		player.hooks.onAttack.remove(component)
	}
}

export default Docm77RareHermitCard
