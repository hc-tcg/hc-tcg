import HermitCard from './_hermit-card'
import {GameModel} from '../../../../server/models/game-model'

class RenbobRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'renbob_rare',
			name: 'Renbob',
			rarity: 'rare',
			hermitType: 'explorer',
			health: 280,
			primary: {
				name: 'Loose Change',
				cost: ['any'],
				damage: 40,
				power: null,
			},
			secondary: {
				name: 'Hyperspace',
				cost: ['explorer', 'explorer'],
				damage: 80,
				power:
					'Damage is dealt to opponent directly opposite this card on the game board, regardless if AFK or active.',
			},
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player, otherPlayer, rowIndex} = pos

		player.hooks.beforeAttack[instance] = (attack) => {
			const attackId = this.getInstanceKey(instance)
			if (attack.id !== attackId || attack.type !== 'secondary') return

			if (rowIndex === null) return
			const otherPlayerRow = otherPlayer.board.rows[rowIndex]

			if (otherPlayerRow.hermitCard) {
				attack.target.index = rowIndex
				attack.target.row = otherPlayerRow
			} else {
				attack.multiplyDamage(0)
				attack.lockDamage()
			}
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player} = pos
		// Remove hooks
		delete player.hooks.onAttack[instance]
	}

	getExpansion() {
		return 'alter_egos'
	}

	getPalette() {
		return 'alter_egos'
	}

	getBackground() {
		return 'alter_egos_background'
	}
}

export default RenbobRareHermitCard
