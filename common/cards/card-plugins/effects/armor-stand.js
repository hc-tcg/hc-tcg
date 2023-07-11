import {GameModel} from '../../../../server/models/game-model'
import {discardCard} from '../../../../server/utils'
import EffectCard from '../effects/_effect-card'
import {isTargetingPos} from '../../../../server/utils/attacks'

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
	 * @param {import('types/cards').CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player, opponentPlayer, row} = pos
		if (!row) return

		row.health = 50
		if (player.board.activeRow === null) {
			player.board.activeRow = pos.rowIndex
		}

		// The menu won't show up but just in case someone tries to cheat
		player.hooks.blockedActions[instance] = (blockedActions, pastTurnActions, availableEnergy) => {
			if (player.board.activeRow === pos.rowIndex) {
				blockedActions.push('PRIMARY_ATTACK')
				blockedActions.push('SECONDARY_ATTACK')
				blockedActions.push('ZERO_ATTACK')
			}

			return blockedActions
		}

		opponentPlayer.hooks.afterAttack[instance] = (attack) => {
			if (!row.health && attack.attacker && isTargetingPos(attack, pos)) {
				// Discard to prevent losing a life
				discardCard(game, row.hermitCard)
				// Reset the active row so the player can switch
				player.board.activeRow = null
			}
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('types/cards').CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player, opponentPlayer, slot, row} = pos
		// Just in case we decide that Fire Charge/Mending/etc work on an Armor Stand that
		// is attached to a Hermit slot
		if (slot && slot.type === 'hermit' && row) {
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
	 * @param {import('types/cards').CardPos} pos
	 */
	canAttach(game, pos) {
		const {slot} = pos
		const {currentPlayer} = game.ds

		if (!slot || slot.type !== 'hermit') return 'INVALID'
		if (pos.player.id !== currentPlayer.id) return 'INVALID'

		return 'YES'
	}

	/**
	 * @param {GameModel} game
	 * @param {import('types/cards').CardPos} pos
	 */
	canAttachToCard(game, pos) {
		return false
	}

	getExpansion() {
		return 'alter_egos'
	}

	isAttachable() {
		return false
	}
}

export default ArmorStandEffectCard
