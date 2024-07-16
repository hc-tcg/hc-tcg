import {GameModel} from '../../../models/game-model'
import {flipCoin} from '../../../utils/coinFlips'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'
import {CardComponent, StatusEffectComponent} from '../../../components'
import FireStatusEffect from '../../../status-effects/fire'
import {card, slot} from '../../../components/query'

class EthosLabRare extends Card {
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
		const {player} = component

		player.hooks.onAttack.add(component, (attack) => {
			if (attack.attacker?.entity === component.entity || attack.type !== 'secondary') return
			if (!(attack.attacker instanceof CardComponent)) return

			const coinFlip = flipCoin(player, attack.attacker)

			if (coinFlip[0] !== 'heads') return

			let opponentActiveHermit = game.components.find(
				CardComponent,
				card.opponentPlayer,
				card.active,
				card.slot(slot.hermitSlot)
			)
			game.components
				.new(StatusEffectComponent, FireStatusEffect)
				.apply(opponentActiveHermit?.entity)
		})
	}

	override onDetach(_game: GameModel, component: CardComponent) {
		const {player} = component
		// Remove hooks
		player.hooks.onAttack.remove(component)
	}
}

export default EthosLabRare
