import {CardComponent} from '../../../components'
import {GameModel} from '../../../models/game-model'
import CardOld from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

class PythonGBRare extends CardOld {
	props: Hermit = {
		...hermit,
		id: 'pythongb_rare',
		numericId: 216,
		name: 'Python',
		expansion: 'advent_of_tcg',
		palette: 'advent_of_tcg',
		background: 'advent_of_tcg',
		rarity: 'rare',
		tokens: 3,
		type: ['redstone'],
		health: 250,
		primary: {
			name: 'Say Whaatt',
			cost: ['any'],
			damage: 30,
			power: null,
		},
		secondary: {
			name: 'The Logfellas',
			cost: ['redstone', 'redstone'],
			damage: 40,
			power:
				'For each of your adjacent Rendogs or Xisumas, attack damage doubles.',
		},
	}

	override onAttach(
		_game: GameModel,
		component: CardComponent,
		_observer: Observer,
	) {
		const {player} = component

		player.hooks.onAttack.add(component, (attack) => {
			if (
				attack.id !== this.getInstanceKey(component) ||
				attack.type !== 'secondary'
			)
				return

			const activeRow = player.board.activeRow
			if (activeRow === null) return

			const logfellaAmount = player.board.rows.filter(
				(row, index) =>
					row.hermitCard &&
					(index === activeRow - 1 || index === activeRow + 1) &&
					[
						'xisumavoid_common',
						'xisumavoid_rare',
						'rendog_common',
						'rendog_rare',
					].includes(row.hermitcard.props.numericId),
			).length

			attack.multiplyDamage(this.props.id, Math.pow(2, logfellaAmount))
		})
	}

	override onDetach(_game: GameModel, component: CardComponent) {
		const {player} = component
		// Remove hooks
		player.hooks.onAttack.remove(component)
	}
}

export default PythonGBRare
