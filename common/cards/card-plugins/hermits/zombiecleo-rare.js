import HermitCard from './_hermit-card'
import {HERMIT_CARDS} from '../../../cards'
import {GameModel} from '../../../../server/models/game-model'
import {getNonEmptyRows} from '../../../../server/utils'

/**
 * @typedef {import('common/types/game-state').AvailableActionT} AvailableActionT
 */

class ZombieCleoRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'zombiecleo_rare',
			name: 'Cleo',
			rarity: 'rare',
			hermitType: 'pvp',
			health: 290,
			primary: {
				name: 'Dismissed',
				cost: ['pvp'],
				damage: 60,
				power: null,
			},
			secondary: {
				name: 'Puppetry',
				cost: ['pvp', 'pvp', 'pvp'],
				damage: 0,
				power: 'Use a secondary attack from any of your AFK Hermits.',
			},
			pickOn: 'attack',
			pickReqs: [
				{target: 'player', type: ['hermit'], amount: 1, active: false},
			],
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('types/cards').CardPos} pos
	 * @param {import('types/attack').HermitAttackType} hermitAttackType
	 * @param {import('types/pick-process').PickedSlots} pickedSlots
	 */
	getAttacks(game, instance, pos, hermitAttackType, pickedSlots) {
		const attacks = super.getAttacks(
			game,
			instance,
			pos,
			hermitAttackType,
			pickedSlots
		)

		if (attacks[0].type !== 'secondary') return attacks

		const pickedHermit = pickedSlots[this.id][0]
		if (!pickedHermit || !pickedHermit.row) return []
		const rowState = pickedHermit.row.state
		if (!rowState.hermitCard) return []
		const hermitInfo = HERMIT_CARDS[rowState.hermitCard.cardId]
		if (!hermitInfo) return []

		// Return that cards secondary attack
		return hermitInfo.getAttacks(
			game,
			rowState.hermitCard.cardInstance,
			pos,
			hermitAttackType,
			pickedSlots
		)
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player} = pos

		player.hooks.blockedActions[instance] = (blockedActions) => {
			const afkHermits = getNonEmptyRows(player, false).length
			if (
				player.board.activeRow === pos.rowIndex &&
				afkHermits <= 0 &&
				!blockedActions.includes('SECONDARY_ATTACK')
			) {
				blockedActions.push('SECONDARY_ATTACK')
			}

			return blockedActions
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player} = pos
		delete player.hooks.blockedActions[instance]
	}
}

export default ZombieCleoRareHermitCard
