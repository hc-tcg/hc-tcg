import HermitCard from './_hermit-card'
import {discardCard, flipCoin, isRemovable} from '../../../../server/utils'
import {swapSlots} from '../../../../server/utils/slots'
import {GameModel} from '../../../../server/models/game-model'
import {getCardPos} from '../../../../server/utils/cards'

// The tricky part about this one are destroyable items (shield, totem, loyalty) since they are available at the moment of attack, but not after

/*
Some assumptions that make sense to me:
- Shield can't be stolen as they get used up during the attack
- If hermitMultiplier is 0 (e.g. invis potion), then shield don't get used and so you can steal it
- Totem/Loyalty can be stolen unless it was used
- If you choose to discard the card it gets discarded to your discard pile
*/

/**
 * @typedef {import('common/types/cards').CardPos} CardPos
 * @typedef {import('common/types/cards').SlotPos} SlotPos
 */

class GrianRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'grian_rare',
			name: 'Grian',
			rarity: 'rare',
			hermitType: 'prankster',
			health: 300,
			primary: {
				name: 'Borrow',
				cost: ['prankster', 'prankster'],
				damage: 50,
				power:
					"Flip a coin after your attack.\n\nIf heads, take opposing active Hermit's effect card and either attach or discard it",
			},
			secondary: {
				name: 'Start a War',
				cost: ['prankster', 'prankster', 'prankster'],
				damage: 100,
				power: null,
			},
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player, row, rowIndex} = pos
		const effectKey = this.getInstanceKey(instance, 'effectCard')
		const targetKey = this.getInstanceKey(instance, 'targetInstance')
		const instanceKey = this.getInstanceKey(instance)
		const modalKey = this.getInstanceKey(instance, 'modal')

		player.hooks.afterAttack.add(instance, (attack) => {
			if (attack.id !== this.getInstanceKey(instance)) return

			if (attack.type !== 'primary') return
			if (!attack.target || !attack.target.row.effectCard) return

			const opponentEffectCard = attack.target.row.effectCard
			if (!opponentEffectCard || !isRemovable(opponentEffectCard)) return

			player.custom[effectKey] = opponentEffectCard
			player.custom[targetKey] = attack.target.row.hermitCard.cardInstance
			// Don't show the modal yet
			player.followUp[instanceKey] = ''
		})

		// We need to wait until Loyalty disappear, it uses onHermitDeath
		player.hooks.onFollowUp.add(instance, (followUp, pickedCards, modalResult) => {
			if (followUp === instanceKey) {
				delete player.followUp[instanceKey]
				const targetInstance = player.custom[targetKey]
				const effectCard = player.custom[effectKey]
				const grianPosition = getCardPos(game, instance)
				const targetPosition = getCardPos(game, targetInstance)
				const effectPosition = getCardPos(game, effectCard.cardInstance)
				delete player.custom[targetKey]

				// Grian is dead, target is dead or the effect card disappeared
				// because the coin toss technically happens after the attack that
				// means that nothing gets stolen
				if (!grianPosition || !targetPosition || !effectPosition) return

				const coinFlip = flipCoin(player, this.id)
				if (coinFlip[0] === 'tails') {
					delete player.custom[effectKey]
				} else {
					// Show the modal
					player.followUp[modalKey] = this.id
				}
			} else if (followUp === modalKey) {
				// Modal Result
				delete player.followUp[modalKey]
				if (!row || rowIndex === null) return

				/** @type {import('../../../types/game-state').CardT} */
				const opponentEffectCard = player.custom[effectKey]
				if (!opponentEffectCard) return

				const effectCardPos = getCardPos(game, opponentEffectCard.cardInstance)
				delete player.custom[effectKey]

				// Totem/Loyalty/Shield got used up
				if (!effectCardPos) return
				if (!effectCardPos.row || effectCardPos.rowIndex === null) return

				if (modalResult.attach) {
					// Discard the card if there is one
					if (row?.effectCard) {
						discardCard(game, row.effectCard)
					}

					/** @type {SlotPos} */ const opponentSlot = {
						rowIndex: effectCardPos.rowIndex,
						row: effectCardPos.row,
						slot: {
							index: 0,

							type: 'effect',
						},
					}

					/** @type {SlotPos} */ const playerSlot = {
						rowIndex,
						row,
						slot: {
							index: 0,
							type: 'effect',
						},
					}

					// Grian's effect slot is going to be empty
					swapSlots(game, opponentSlot, playerSlot)
				} else {
					discardCard(game, opponentEffectCard, true)
				}
			}
		})

		player.hooks.onFollowUpTimeout.add(instance, (followUp) => {
			// Disable the followUp for both of them, we want to avoid infinite loops
			// between the client and the server, the first one should never time out
			// but just in case
			if ([instanceKey, modalKey].includes[followUp]) {
				delete player.followUp[instanceKey]
				delete player.followUp[modalKey]
			}
			if (followUp !== modalKey) return

			const opponentEffectCard = player.custom[effectKey]
			const effectCardPos = getCardPos(game, opponentEffectCard.cardInstance)
			if (!effectCardPos || !effectCardPos.row) return

			// Discard the card if the player didn't choose
			discardCard(game, effectCardPos.row.effectCard)
			player.discarded.push({
				cardId: opponentEffectCard.cardId,
				cardInstance: opponentEffectCard.cardInstance,
			})
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player} = pos
		player.hooks.afterAttack.remove(instance)
		player.hooks.onFollowUp.remove(instance)
		player.hooks.onFollowUpTimeout.remove(instance)
		delete player.custom[this.getInstanceKey(instance, 'effectCard')]
		delete player.custom[this.getInstanceKey(instance, 'targetInstance')]
		// The hooks were deleted so it won't ever find the hook
		delete player.followUp[this.getInstanceKey(instance)]
		delete player.followUp[this.getInstanceKey(instance, 'modal')]
	}
}

export default GrianRareHermitCard
