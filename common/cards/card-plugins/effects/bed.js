import EffectCard from './_effect-card'
import {HERMIT_CARDS} from '../../../cards'
import {discardCard} from '../../../../server/utils'
import {GameModel} from '../../../../server/models/game-model'
import {CardPos} from '../../../../server/models/card-pos-model'

class BedEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'bed',
			name: 'Bed',
			rarity: 'ultra_rare',
			description:
				"Player sleeps for the rest of this and next 2 turns. Can't attack. Restores full health when bed is attached.\n\nCan still draw and attach cards while sleeping.\n\nMust be placed on active hermit.\n\nDiscard after player wakes up.\n\n\n\nCan not go afk while sleeping.\n\nIf made afk by opponent player, hermit goes afk but also wakes up.",
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {CardPos} pos
	 */
	canAttach(game, pos) {
		const {currentPlayer} = game.ds

		if (!pos.slot || pos.slot.type !== 'effect') return 'INVALID'
		if (pos.player.id !== currentPlayer.id) return 'INVALID'
		if (!pos.row?.hermitCard) return 'NO'

		// bed addition - hermit must also be active to attach
		if (!(currentPlayer.board.activeRow === pos.rowIndex)) return 'NO'

		return 'YES'
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onAttach(game, instance, pos) {
		// Give the current row sleeping for 3 turns
		const {player, row} = pos
		const hermitSlot = this.getInstanceKey(instance, 'hermitSlot')

		if (row && row.hermitCard) {
			row.health = HERMIT_CARDS[row.hermitCard.cardId].health

			// Clear any previous sleeping
			row.ailments = row.ailments.filter((a) => a.id !== 'sleeping')

			// Set new sleeping for 3 turns (2 + the current turn)
			row.ailments.push({id: 'sleeping', duration: 3})
		}

		// Knockback/Tango/Jevin/etc
		player.hooks.onTurnStart[instance] = () => {
			const isSleeping = pos.row?.ailments.some((a) => a.id === 'sleeping')
			if (!isSleeping) {
				discardCard(game, pos.row?.effectCard || null)
				return
			}
		}

		player.hooks.beforeApply[instance] = (pickedSlots, modalResult) => {
			player.custom[hermitSlot] = pos.row?.hermitCard?.cardInstance
		}

		//Ladder
		player.hooks.afterApply[instance] = (pickedSlots, modalResult) => {
			const {row} = pos
			if (player.custom[hermitSlot] != row?.hermitCard?.cardInstance && row && row.hermitCard) {
				row.health = HERMIT_CARDS[row.hermitCard.cardId].health

				// Clear any previous sleeping
				row.ailments = row.ailments.filter((a) => a.id !== 'sleeping')

				// Set new sleeping for 3 turns (2 + the current turn)
				row.ailments.push({id: 'sleeping', duration: 3})
			}
			delete player.custom[hermitSlot]
		}

		player.hooks.onTurnEnd[instance] = () => {
			const {row} = pos
			const isSleeping = row?.ailments.some((a) => a.id === 'sleeping')

			// if sleeping has worn off, discard the bed
			if (!isSleeping) {
				discardCard(game, row?.effectCard || null)
				delete player.hooks.onTurnEnd[instance]
			}
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player} = pos
		delete player.hooks.onTurnEnd[instance]
		delete player.hooks.onTurnStart[instance]
		delete player.hooks.beforeApply[instance]
		delete player.hooks.afterApply[instance]
		delete player.custom[this.getInstanceKey(instance, 'hermitSlot')]
	}
}

export default BedEffectCard
