import {GameModel} from '../../../../server/models/game-model'
import {HERMIT_CARDS} from '../../../cards'
import {discardCard} from '../../../../server/utils'
import EffectCard from '../effects/_effect-card'
import {isTargetingPos} from '../../../../server/utils/attacks'

/**
 * @typedef {import('common/types/cards').CardPos} CardPos
 */

class ArmorStandEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'armor_stand',
			name: 'Armour Stand',
			rarity: 'ultra_rare',
			description:
				"Use like a Hermit card. Has 50hp.\n\nCan not attack. Can not attach cards to it.\nOpponent does not get a point when it's knocked out.",
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player, opponentPlayer, slot, row} = pos
		if (!row) return

		if (slot.type === 'hermit') {
			row.health = 50
			if (player.board.activeRow === null) {
				player.board.activeRow = pos.rowIndex
			}

			// The menu won't show up but just in case someone tries to cheat
			player.hooks.blockedActions[instance] = (
				blockedActions,
				pastTurnActions,
				availableEnergy
			) => {
				if (player.board.activeRow === pos.rowIndex) {
					blockedActions.push('PRIMARY_ATTACK')
					blockedActions.push('SECONDARY_ATTACK')
					blockedActions.push('ZERO_ATTACK')
				}

				return blockedActions
			}

			opponentPlayer.hooks.afterAttack[instance] = (attack) => {
				if (attack.calculateDamage() >= 50 && attack.attacker && isTargetingPos(attack, pos)) {
					// Discard to prevent losing a life
					discardCard(game, row.hermitCard)
					// Reset the active row so the player can switch
					player.board.activeRow = null
				}
			}
		} else {
			const instanceKey = this.getInstanceKey(instance)

			opponentPlayer.hooks.onAttack[instance] = (attack, pickedSlots) => {
				if (attack.target.rowIndex !== pos.rowIndex || attack.type === 'ailment') return

				if (player.custom[instanceKey] === undefined) {
					player.custom[instanceKey] = 0
				}

				const totalReduction = player.custom[instanceKey]

				if (totalReduction < 50) {
					const damageReduction = Math.min(attack.damage, 50 - totalReduction)
					player.custom[instanceKey] += damageReduction
					attack.reduceDamage(damageReduction)
				}
			}

			opponentPlayer.hooks.afterAttack[instance] = (attackResult) => {
				const {player, row} = pos

				if (player.custom[instanceKey] > 0 && row) {
					discardCard(game, row.effectCard)
				}
			}

			opponentPlayer.hooks.onTurnEnd[instance] = () => {
				delete player.custom[instanceKey]
			}
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player, opponentPlayer, slot, row} = pos
		// Just in case we decide that Fire Charge/Mending/etc work on an Armor Stand that
		// is attached to a Hermit slot
		if (slot.type === 'hermit' && row) {
			row.health = null
		}

		delete player.hooks.blockedActions[instance]
		delete opponentPlayer.hooks.onAttack[instance]
		delete opponentPlayer.hooks.afterAttack[instance]
		delete opponentPlayer.hooks.onTurnEnd[instance]
		delete player.custom[this.getInstanceKey(instance)]
	}

	/**
	 * @param {GameModel} game
	 * @param {CardPos} pos
	 */
	canAttach(game, pos) {
		const {player, slot, row} = pos
		const {currentPlayer} = game.ds

		if (!['hermit', 'effect'].includes(slot.type)) return 'INVALID'
		if (pos.player.id !== currentPlayer.id) return 'INVALID'

		if (slot.type === 'effect') {
			if (!row || !row.hermitCard) return 'INVALID'
			const hermitInfo = HERMIT_CARDS[row.hermitCard?.cardId]
			if (!hermitInfo) return 'INVALID'
			if (!hermitInfo.canAttachToCard(game, pos)) return 'NO'
		}

		return 'YES'
	}

	/**
	 * @param {GameModel} game
	 * @param {CardPos} pos
	 */
	canAttachToCard(game, pos) {
		return false
	}

	getExpansion() {
		return 'alter_egos'
	}
}

export default ArmorStandEffectCard
