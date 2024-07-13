import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../components'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

class Biffa2001RareHermitCard extends Card {
	props: Hermit = {
		...hermit,
		id: 'biffa2001_rare',
		numericId: 206,
		name: 'Biffa',
		expansion: 'advent_of_tcg',
		palette: 'advent_of_tcg',
		background: 'advent_of_tcg',
		rarity: 'rare',
		tokens: 3,
		type: 'miner',
		health: 290,
		primary: {
			name: 'O.H.O',
			cost: ['miner'],
			damage: 40,
			power: null,
		},
		secondary: {
			name: "Biffa's Museum",
			cost: ['miner', 'any'],
			damage: 70,
			power: 'For each card you played or used this turn, this attack does 20 more damage.',
		},
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player} = component

		applyStatusEffect(game, 'museum-collection', component)

		player.hooks.onTurnStart.add(component, () => {
			applyStatusEffect(game, 'museum-collection', component)
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = component
		// Remove hooks
		player.hooks.onTurnStart.remove(component)
	}
}

export default Biffa2001RareHermitCard
