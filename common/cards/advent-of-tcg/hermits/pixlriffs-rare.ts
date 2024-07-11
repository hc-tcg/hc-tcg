import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {CardInstance} from '../../../types/game-state'
import Card, {Hermit, hermit} from '../../base/card'

class PixlriffsRareHermitCard extends Card {
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

	public override onAttach(game: GameModel, instance: CardInstance, pos: CardPosModel): void {
		const {player} = pos

		let startingRow = pos.row

		player.hooks.onTurnStart.add(instance, () => {
			startingRow = pos.row
		})

		player.hooks.onAttack.add(instance, (attack) => {
			if (attack.id !== this.getInstanceKey(instance) || attack.type !== 'secondary') return

			if (startingRow !== player.board.activeRow) attack.addDamage(this.props.id, 40)
		})
	}

	public override onDetach(game: GameModel, instance: CardInstance, pos: CardPosModel): void {
		const {player} = pos
		player.hooks.onAttack.remove(instance)
	}
}

export default PixlriffsRareHermitCard
