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
		const timeSkipHeads = this.getInstanceKey(instance, 'timeSkipHeads')
		const joeUsedSecondary = this.getInstanceKey(instance, 'joeUsedSecondary')

		player.hooks.onAttack[instance] = (attack) => {
			delete player.custom[joeUsedSecondary]
			delete player.custom[timeSkipHeads]

			if (attack.id !== instanceKey || attack.type !== 'secondary') return

			const coinFlip = flipCoin(player)
			player.coinFlips[this.id] = coinFlip

			if (coinFlip[0] === 'heads') player.custom[timeSkipHeads] = true
			player.custom[joeUsedSecondary] = true
		}

		otherPlayer.hooks.availableActions[instance] = (availableActions) => {
			if (player.custom[timeSkipHeads]) {
				if (otherPlayer.board.activeRow === null)
					availableActions.filter((a) =>
						['CHANGE_ACTIVE_HERMIT', 'END_TURN'].includes(a)
					)
				else availableActions.filter((a) => a === 'END_TURN')
			}

			return availableActions
		}

		player.hooks.availableActions[instance] = (availableActions) => {
			if (player.board.activeRow !== pos.rowIndex) return availableActions

			if (player.custom[joeUsedSecondary]) {
				return availableActions.filter((a) => a !== 'SECONDARY_ATTACK')
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
