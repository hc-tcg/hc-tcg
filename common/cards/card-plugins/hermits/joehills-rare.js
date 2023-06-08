import HermitCard from './_hermit-card'
import {flipCoin} from '../../../../server/utils'
import {GameModel} from '../../../../server/models/game-model'

/*
- It was confirmed by Beef that by "consecutively" it is meant not only the power but the attack for 90 itself.
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
		const instanceKey = this.getInstanceKey(instance)
		const timeSkipKey = this.getInstanceKey(instance, 'timeSkipKey')

		player.hooks.onAttack[instance] = (attack) => {
			if (attack.id !== instanceKey || attack.type !== 'secondary') return

			// can't be used on first turn
			if (game.state.turn < 2) return
			// can't be used consecutively
			if (player.custom[this.id]) return

			const coinFlip = flipCoin(player)
			player.coinFlips[this.id] = coinFlip

			if (coinFlip[0] === 'heads') player.custom[timeSkipKey] = 'time_skip'
		}

		otherPlayer.hooks.availableActions[instance] = (availableActions) => {
			if (player.custom[timeSkipKey] == 'time_skip') {
				if (otherPlayer.board.activeRow === null)
					availableActions = ['CHANGE_ACTIVE_HERMIT']
				else availableActions = []
				player.custom[timeSkipKey] = 'prevent_consecutive'
			}

			console.log('time skip')

			return availableActions
		}

		// Disable Time Skip attack consecutively
		player.hooks.availableActions[instance] = (availableActions) => {
			// The same Joe card must be active to disable time skip
			if (player.board.activeRow !== pos.rowIndex) return availableActions

			// we want to make changes only if time skip was used by the hermit
			if (player.custom[timeSkipKey] == 'prevent_consecutive') {
				player.custom[timeSkipKey] = 'time_skip_complete'
				return availableActions.filter(
					(action) => action !== 'SECONDARY_ATTACK'
				)
			}
			return availableActions
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player, otherPlayer} = pos
		const timeSkipKey = this.getInstanceKey(instance, 'timeSkipKey')
		// Remove hooks
		delete player.hooks.onAttack[instance]
		delete otherPlayer.hooks.availableActions[instance]
		delete player.hooks.availableActions[instance]
		delete player.custom[timeSkipKey]
	}
}

export default JoeHillsRareHermitCard
