import HermitCard from './_hermit-card'
import {GameModel} from '../../../../server/models/game-model'
import {flipCoin} from '../../../../server/utils'

/**
 * @typedef {import('common/types/pick-process').PickRequirmentT} PickRequirmentT
 */

/*
- Has to support having two different afk targets (one for hypno, one for su effect like bow)
- If the afk target for Hypno's ability & e.g. bow are the same, don't apply weakness twice
- TODO - Can't use Got 'Em to attack AFK hermits even with Efficiency if Hypno has no item cards to discard
*/
class HumanCleoRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'humancleo_rare',
			name: 'Human Cleo',
			rarity: 'rare',
			hermitType: 'pvp',
			health: 270,
			primary: {
				name: 'Humanity',
				cost: ['pvp'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Betrayed',
				cost: ['pvp', 'pvp'],
				damage: 70,
				power:
					'Flip a coin, twice. If both are heads, your opponent must attack the hermit directly opposite this card on their next turn. Opponent must have necessary item cards attached to execute an attack.',
			},
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player, otherPlayer} = pos

		player.hooks.onAttack[instance] = (attack) => {
			if (
				attack.id !== this.getInstanceKey(instance) ||
				attack.type !== 'secondary'
			)
				return

			const coinFlip = flipCoin(player, this.id, 2)
			player.coinFlips[this.id] = coinFlip

			const headsAmount = coinFlip.filter((flip) => flip === 'heads').length
			if (headsAmount < 2) return

			player.custom[instance] = true

			otherPlayer.hooks.blockedActions[instance] = (blockedActions) => {
				/** @type {AvailableActionsT}*/
				const blocked = ['END_TURN']

				if (otherPlayer.board.activeRow !== null) {
					blocked.push('CHANGE_ACTIVE_HERMIT')
				}

				blockedActions.push(...blocked)
				return blockedActions
			}
		}

		otherPlayer.hooks.beforeAttack[instance] = (attack) => {
			delete otherPlayer.hooks.blockedActions[instance]
			if (!player.custom[instance]) return
			if (['backlash', 'ailment'].includes(attack.type)) return
			if (!attack.attacker || !pos.rowIndex) return
			const otherPlayerRow = otherPlayer.board.rows[pos.rowIndex]
			if (!otherPlayerRow.hermitCard) return

			attack.target = {
				index: pos.rowIndex,
				row: otherPlayerRow,
			}

			delete player.custom[instance]
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player, otherPlayer} = pos

		// Remove hooks
		delete player.hooks.onAttack[instance]
		delete otherPlayer.hooks.beforeAttack[instance]
		delete otherPlayer.hooks.onTurnEnd[instance]
		delete otherPlayer.hooks.blockedActions[instance]
		delete player.custom[instance]
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

export default HumanCleoRareHermitCard
