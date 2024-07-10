import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../types/game-state'
import Card, {Hermit, hermit} from '../../base/card'

class PythonGBRareHermitCard extends Card {
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
		type: 'redstone',
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
			power: 'For each of your adjacent Rendogs or Xisumas, attack damage doubles.',
		},
	}

	override onAttach(game: GameModel, instance: CardComponent, pos: CardPosModel) {
		const {player} = pos

		player.hooks.onAttack.add(instance, (attack) => {
			if (attack.id !== this.getInstanceKey(instance) || attack.type !== 'secondary') return

			const activeRow = player.board.activeRow
			if (activeRow === null) return

			const logfellaAmount = player.board.rows.filter(
				(row, index) =>
					row.hermitCard &&
					(index === activeRow - 1 || index === activeRow + 1) &&
					['xisumavoid_common', 'xisumavoid_rare', 'rendog_common', 'rendog_rare'].includes(
						row.hermitCard.props.id
					)
			).length

			attack.multiplyDamage(this.props.id, Math.pow(2, logfellaAmount))
		})
	}

	override onDetach(game: GameModel, instance: CardComponent, pos: CardPosModel) {
		const {player} = pos
		// Remove hooks
		player.hooks.onAttack.remove(instance)
	}
}

export default PythonGBRareHermitCard
