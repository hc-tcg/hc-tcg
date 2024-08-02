import {CardComponent} from '../../../components'
import {GameModel} from '../../../models/game-model'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

class PixlriffsRare extends Card {
	props: Hermit = {
		...hermit,
		id: 'pixlriffs_rare',
		numericId: 215,
		name: 'Pixl',
		expansion: 'advent_of_tcg',
		palette: 'advent_of_tcg',
		background: 'advent_of_tcg',
		rarity: 'rare',
		tokens: 1,
		type: 'explorer',
		health: 290,
		primary: {
			name: 'Lore Keeper',
			cost: ['explorer'],
			damage: 60,
			power: null,
		},
		secondary: {
			name: 'World Build',
			cost: ['explorer', 'explorer', 'any'],
			damage: 90,
			power:
				'If this Hermit has moved since the start of your turn, World Build deals 40hp more damage.',
		},
	}

	public override onAttach(_game: GameModel, component: CardComponent): void {
		const {player} = component

		let startingRow = pos.rowId

		player.hooks.onTurnStart.add(component, () => {
			startingRow = pos.rowId
		})

		player.hooks.onAttack.add(component, (attack) => {
			if (
				attack.id !== this.getInstanceKey(component) ||
				attack.type !== 'secondary'
			)
				return

			if (startingRow !== player.board.activeRow)
				attack.addDamage(this.props.id, 40)
		})
	}

	public override onDetach(_game: GameModel, component: CardComponent): void {
		const {player} = component
		player.hooks.onAttack.remove(component)
	}
}

export default PixlriffsRare
