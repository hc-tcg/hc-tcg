import {CardComponent} from '../../../components'
import query from '../../../components/query'
import {hermit} from '../../defaults'
import {Hermit} from '../../types'

const CyberpunkImpulseRare: Hermit = {
	...hermit,
	id: 'cyberpunkimpulse_rare',
	numericId: 1407,
	name: 'Cyberpunk Impulse',
	shortName: 'C. Impulse',
	expansion: 'hc_plus',
	palette: 'advent_of_tcg_ii',
	background: 'advent_of_tcg_ii',
	rarity: 'rare',
	tokens: 1,
	type: ['farm'],
	health: 300,
	primary: {
		name: "Bop 'N' Go",
		cost: [],
		damage: 0,
		power:
			'Farm item cards attached to this act as wild items attached to adjacent hermits for their attacks.',
		passive: true,
	},
	secondary: {
		name: 'Electrify',
		cost: ['farm', 'any'],
		damage: 70,
		power: null,
	},
	onAttach(game, component, observer) {
		// Prevent mocking passive
		if (component.props !== this) return

		const {player} = component

		observer.subscribe(player.hooks.availableEnergy, (availableEnergy) => {
			if (!component.slot.inRow()) return availableEnergy

			const activeRow = player.activeRow
			if (
				!activeRow ||
				Math.abs(activeRow.index - component.slot.row.index) !== 1
			)
				return availableEnergy

			game.components
				.filter(
					CardComponent,
					query.card.isItem,
					query.card.attached,
					query.card.row(
						query.row.entity(component.slot.rowEntity),
						query.row.adjacent(query.row.active),
					),
				)
				.flatMap((card) => {
					if (!card.isItem()) return []
					return card.props.energy
				})
				.forEach((newEnergy) => {
					if (newEnergy === 'farm') availableEnergy.push('any')
				})
			return availableEnergy
		})
	},
}

export default CyberpunkImpulseRare
