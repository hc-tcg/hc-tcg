import EffectCard from './_effect-card'
import {GameModel} from '../../../../server/models/game-model'
import {HERMIT_CARDS} from '../../../../common/cards'
import {hasEnoughItems} from '../../../../server/utils'

/**
 * @typedef {import('common/types/pick-process').PickedSlots} PickedSlots
 * @typedef {import('common/types/cards').CardPos} CardPos
 */

class CommandBlockEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'command_block',
			name: 'Command Block',
			rarity: 'rare',
			description:
				"Attach to any active or AFK Hermit.\n\nItems attached to this Hermit become any type.\n\nThis card can only be removed once the Hermit it's attached to is knocked out.",
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player} = pos

		// Used to know if the hermit has attacked this turn
		player.custom[this.getInstanceKey(instance)] = false

		player.hooks.availableActions[instance] = (availableActions) => {
			const attacked = player.custom[this.getInstanceKey(instance)]

			if (attacked || player.board.activeRow !== pos.rowIndex)
				return availableActions

			const {activeRow, rows} = player.board
			if (activeRow === null || !rows[activeRow]) return availableActions

			const hermitCard = rows[activeRow].hermitCard
			if (!hermitCard) return availableActions

			const ailments = rows[activeRow].ailments
			const isSleeping = ailments.find((a) => a.id === 'sleeping')
			const isSlow = ailments.find((a) => a.id === 'slowness')
			const hermitInfo = HERMIT_CARDS[hermitCard.cardId]
			const primaryHasEnoughItems = hasEnoughItems(
				rows[activeRow].itemCards.filter(Boolean),
				hermitInfo.primary.cost.map(() => 'any')
			)
			const secondaryHasEnoughItems = hasEnoughItems(
				rows[activeRow].itemCards.filter(Boolean),
				hermitInfo.secondary.cost.map(() => 'any')
			)

			if (!isSleeping) {
				if (
					primaryHasEnoughItems &&
					!availableActions.includes('PRIMARY_ATTACK')
				) {
					availableActions.push('PRIMARY_ATTACK')
				}

				if (
					!isSlow &&
					secondaryHasEnoughItems &&
					!availableActions.includes('SECONDARY_ATTACK')
				) {
					availableActions.push('SECONDARY_ATTACK')
				}
			}

			return availableActions
		}

		player.hooks.afterAttack[instance] = (attackResult) => {
			player.custom[this.getInstanceKey(instance)] = true
		}

		player.hooks.turnStart[instance] = () => {
			player.custom[this.getInstanceKey(instance)] = false
		}
	}

	onDetach(game, instance, pos) {
		const {player} = pos
		delete player.hooks.availableActions[instance]
		delete player.hooks.afterAttack[instance]
		delete player.hooks.turnStart[instance]
		delete player.custom[this.getInstanceKey(instance, 'attacked')]
		delete player.custom[this.getInstanceKey(instance, 'rowIndex')]
	}

	/**
	 * @returns {boolean}
	 */
	getIsRemovable() {
		return false
	}

	getExpansion() {
		return 'alter_egos'
	}
}

export default CommandBlockEffectCard
