import {BoardSlotComponent, CardComponent} from '../../../components'
import query from '../../../components/query'
import {hermit} from '../../defaults'
import {Hermit} from '../../types'

const CyberpunkImpulseRare: Hermit = {
	...hermit,
	id: 'cyberpunkimpulse_rare',
	numericId: 254,
	name: 'Cyberpunk Impulse',
	expansion: 'advent_of_tcg',
	palette: 'advent_of_tcg',
	background: 'advent_of_tcg',
	rarity: 'rare',
	tokens: 0,
	type: 'farm',
	health: 300,
	primary: {
		name: "Bop 'N' Go",
		cost: [],
		damage: 0,
		power:
			'Farm item cards attached to this act as wild items attached to adjacent hermits.',
		passive: true,
	},
	secondary: {
		name: 'Electrify',
		cost: ['farm', 'any'],
		damage: 70,
		power: null,
	},
	onAttach(game, component, observer) {
		const {player} = component
		const {rowEntity} = component.slot as BoardSlotComponent

		observer.subscribe(player.hooks.availableEnergy, (availableEnergy) => {
			const energy = game.components
				.filter(
					CardComponent,
					query.card.isItem,
					query.card.attached,
					query.card.rowEntity(rowEntity),
					query.card.slot(query.slot.player(game.currentPlayer.entity)),
				)
				.flatMap((card) => {
					if (!card.isItem()) return []
					return card.props.energy
				})
			energy.forEach((newEnergy) => {
				if (newEnergy === 'farm') availableEnergy.push('any')
			})
			return availableEnergy
		})
	},
}

export default CyberpunkImpulseRare
