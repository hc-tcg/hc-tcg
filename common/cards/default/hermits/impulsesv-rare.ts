import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import HermitCard from '../../base/hermit-card'

class ImpulseSVRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'impulsesv_rare',
			numericId: 41,
			name: 'Impulse',
			rarity: 'rare',
			hermitType: 'redstone',
			health: 250,
			primary: {
				name: 'Bop',
				cost: ['redstone'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Boomer',
				cost: ['redstone', 'any'],
				damage: 70,
				power:
					'For each of your AFK Bdubs or Tangos, add an additional 40hp damage up to a maximum of 80hp damage.',
			},
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.onAttack.add(instance, (attack) => {
			if (attack.id !== this.getInstanceKey(instance) || attack.type !== 'secondary') return
			const boomerAmount = player.board.rows.filter(
				(row, index) =>
					row.hermitCard &&
					index !== player.board.activeRow &&
					['bdoubleo100_common', 'bdoubleo100_rare', 'tangotek_common', 'tangotek_rare'].includes(
						row.hermitCard.cardId
					)
			).length

			attack.addDamage(this.id, Math.min(boomerAmount, 2) * 40)
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		// Remove hooks
		player.hooks.onAttack.remove(instance)
	}
}

export default ImpulseSVRareHermitCard
