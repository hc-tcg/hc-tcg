import HermitCard from './_hermit-card'
import {GameModel} from '../../../../server/models/game-model'
import {AttackModel} from '../../../../server/models/attack-model'

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
	 * Creates and returns attack objects
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 * @param {import('../../../types/attack').HermitAttackType} hermitAttackType
	 * @param {import('../../../types/pick-process').PickedSlots} pickedSlots
	 * @returns {Array<AttackModel>}
	 */
	getAttacks(game, instance, pos, hermitAttackType, pickedSlots) {
		const {player, otherPlayer} = pos
		let attack = super.getAttacks(
			game,
			instance,
			pos,
			hermitAttackType,
			pickedSlots
		)[0]
		if (attack.type === 'secondary' && pos.rowIndex) {
			attack.target.index = pos.rowIndex
			const otherPlayerRow = otherPlayer.board.rows[pos.rowIndex]
			if (otherPlayerRow.hermitCard) {
				attack.target.row = otherPlayerRow
			} else {
				attack.target.row = {
					hermitCard: {
						cardId: 'renbob_rare',
						cardInstance: 'random_instance',
					},
					effectCard: null,
					itemCards: [],
					health: 0,
					ailments: [],
				}
			}
		}

		return [attack]
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
