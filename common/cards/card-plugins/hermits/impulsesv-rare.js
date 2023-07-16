import HermitCard from './_hermit-card'
import {GameModel} from '../../../../server/models/game-model'

class ImpulseSVRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'impulsesv_rare',
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

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('common/types/cards').CardPos} pos
	 */
	onAttach(game, instance, pos) {
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

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('common/types/cards').CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player} = pos
		// Remove hooks
		player.hooks.onAttack.remove(instance)
	}
}

export default ImpulseSVRareHermitCard
