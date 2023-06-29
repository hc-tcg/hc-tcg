import EffectCard from './_effect-card'
import {HERMIT_CARDS} from '../../../cards'
import {discardCard} from '../../../../server/utils'
import {getCardPos} from '../../../../server/utils/cards'
import {GameModel} from '../../../../server/models/game-model'
/*
Info confirmed by beef:
- If knockback is used, sleeping opponent goes AFK but wakes up.
- Discarding/Stealing the bed does not effect the sleeping opponent.
- You can use single use effects while sleeping that don't cause any damage.
- Bed can be placed only on active hermit.
- You go to sleep the moment you place the bed down so technically you lose 3 turns of attacking.
*/
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
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	canAttach(game, pos) {
		const {currentPlayer} = game.ds

		if (pos.slot.type !== 'effect') return 'INVALID'
		if (pos.player.id !== currentPlayer.id) return 'INVALID'
		if (!pos.row?.hermitCard) return 'NO'

		// bed addition - hermit must also be active to attach
		if (!(currentPlayer.board.activeRow === pos.rowIndex)) return 'NO'

		return 'YES'
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onAttach(game, instance, pos) {
		// Give the current row sleeping for 3 turns
		const {player, row} = pos

		if (row && row.hermitCard) {
			row.health = HERMIT_CARDS[row.hermitCard.cardId].health

			// Clear any previous sleeping
			row.ailments = row.ailments.filter((a) => a.id !== 'sleeping')

			// Set new sleeping for 3 turns (2 + the current turn)
			row.ailments.push({id: 'sleeping', duration: 3})
		}

		// Knockback/Tango/Jevin/etc
		player.hooks.onTurnStart[instance] = () => {
			const isSleeping = row?.ailments.some((a) => a.id === 'sleeping')
			if (!isSleeping) {
				discardCard(game, row?.effectCard || null)
				return
			}
		}

		player.hooks.onTurnEnd[instance] = () => {
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
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player} = pos
		delete player.hooks.onTurnEnd[instance]
		delete player.hooks.onTurnStart[instance]
	}
}

export default BedEffectCard
