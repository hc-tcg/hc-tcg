import HermitCard from './_hermit-card'
import {flipCoin} from '../../../../server/utils'
import {GameModel} from '../../../../server/models/game-model'
import {CardPos} from '../../../../server/models/card-pos-model'

/**
 * @typedef {import('common/types/game-state').AvailableActionsT} AvailableActionsT
 */
class JoeHillsRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'joehills_rare',
			name: 'Joe',
			rarity: 'rare',
			hermitType: 'farm',
			health: 270,
			primary: {
				name: 'Grow Hills',
				cost: ['farm'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Time Skip',
				cost: ['farm', 'farm', 'any'],
				damage: 90,
				power:
					'Flip a coin. If heads, opponent skips their next turn. "Time Skip" can not be used statusly.',
			},
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player, opponentPlayer} = pos
		const status = this.getInstanceKey(instance, 'status')
		player.custom[status] = 'normal'

		player.hooks.onAttack[instance] = (attack) => {
			if (attack.id !== this.getInstanceKey(instance)) return
			if (player.custom[status] != 'normal') {
				player.custom[status] = 'normal'
				return
			}
			if (attack.type !== 'secondary') return
			player.custom[status] = 'block'

			const coinFlip = flipCoin(player, this.id, 1)
			if (coinFlip[0] !== 'heads') return

			// Block all the actions of the opponent
			opponentPlayer.hooks.blockedActions[instance] = (blockedActions) => {
				/** @type {AvailableActionsT}*/
				const blocked = [
					'APPLY_EFFECT',
					'REMOVE_EFFECT',
					'ZERO_ATTACK',
					'PRIMARY_ATTACK',
					'SECONDARY_ATTACK',
					'ADD_HERMIT',
					'PLAY_ITEM_CARD',
					'PLAY_SINGLE_USE_CARD',
					'PLAY_EFFECT_CARD',
				]

				if (opponentPlayer.board.activeRow !== null) {
					blocked.push('CHANGE_ACTIVE_HERMIT')
				}
				blockedActions.push(...blocked)
				return blockedActions
			}

			// Stop blocking the actions of the opponent when their turn ends
			opponentPlayer.hooks.onTurnEnd[instance] = () => {
				delete opponentPlayer.hooks.blockedActions[instance]
				delete opponentPlayer.hooks.onTurnEnd[instance]
			}
		}

		// Block the secondary attack of Joe
		player.hooks.blockedActions[instance] = (blockedActions) => {
			if (player.custom[status] === 'normal') return blockedActions
			/** @type {AvailableActionsT}*/
			const blocked = ['SECONDARY_ATTACK']
			blockedActions.push(...blocked)

			return blockedActions
		}

		// Advance the status flag at the start of your turn after time skip
		player.hooks.onTurnStart[instance] = () => {
			if (player.custom[status] !== 'block') return
			player.custom[status] = 'blocked'
		}

		// If you didn't attack or switched your active hermit, reset the status flag
		player.hooks.onTurnEnd[instance] = () => {
			if (player.custom[status] !== 'blocked') return
			player.custom[status] = 'normal'
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player, opponentPlayer} = pos
		const status = this.getInstanceKey(instance, 'status')
		// Remove hooks
		delete player.hooks.onAttack[instance]
		delete player.hooks.blockedActions[instance]
		delete player.hooks.onTurnEnd[instance]
		delete player.hooks.onTurnStart[instance]
		delete player.custom[status]
	}
}

export default JoeHillsRareHermitCard
