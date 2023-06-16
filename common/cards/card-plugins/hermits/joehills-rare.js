import HermitCard from './_hermit-card'
import {flipCoin} from '../../../../server/utils'
import {GameModel} from '../../../../server/models/game-model'

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
					'Flip a coin. If heads, opponent skips their next turn. "Time Skip" can not be used consecutively.',
			},
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('common/types/cards').CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player, otherPlayer} = pos
		const state = this.getInstanceKey(instance, 'state')
		const heads = this.getInstanceKey(instance, 'heads')

		player.hooks.turnStart[instance] = () => {
			delete player.custom[heads]
			if (player.custom[state] === 'used-timeskip') {
				player.custom[state] = 'timeskip-complete'
			}
		}

		player.hooks.turnEnd[instance] = () => {
			if (player.custom[state] === 'timeskip-complete') {
				delete player.custom[state]
			}
		}

		player.hooks.onAttack[instance] = (attack) => {
			if (
				attack.id !== this.getInstanceKey(instance) ||
				attack.type !== 'secondary'
			) {
				return
			}

			const coinFlip = flipCoin(player)
			player.coinFlips[this.id] = coinFlip

			if (coinFlip[0] === 'heads') player.custom[heads] = true
			player.custom[state] = 'used-timeskip'
		}

		player.hooks.blockedActions[instance] = (blockedActions) => {
			if (
				player.board.activeRow !== pos.rowIndex ||
				player.custom[state] !== 'timeskip-complete'
			) {
				return blockedActions
			}
			/** @type {AvailableActionsT}*/
			const blocked = ['SECONDARY_ATTACK']
			blockedActions.push(...blocked)

			return blockedActions
		}

		otherPlayer.hooks.blockedActions[instance] = (blockedActions) => {
			if (!player.custom[heads]) return blockedActions
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

			if (otherPlayer.board.activeRow !== null) {
				blocked.push('CHANGE_ACTIVE_HERMIT')
			}
			blockedActions.push(...blocked)
			return blockedActions
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player, otherPlayer} = pos
		const state = this.getInstanceKey(instance, 'state')
		const heads = this.getInstanceKey(instance, 'heads')
		// Remove hooks
		delete player.hooks.onAttack[instance]
		delete player.hooks.blockedActions[instance]
		delete player.hooks.turnStart[instance]
		delete player.hooks.turnEnd[instance]
		delete otherPlayer.hooks.blockedActions[instance]
		delete player.custom[state]
		delete player.custom[heads]
	}
}

export default JoeHillsRareHermitCard
