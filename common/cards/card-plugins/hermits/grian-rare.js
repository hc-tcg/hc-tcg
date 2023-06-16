import HermitCard from './_hermit-card'
import {discardCard, flipCoin, isRemovable} from '../../../../server/utils'
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
					"Flip a coin after your attack.\n\nIf heads,take opposing active Hermit's effect card and either attach or discard it",
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
		const {player, row} = pos
		const key = this.getInstanceKey(instance)

		player.hooks.onAttack[instance] = (attack, pickedSlots) => {
			// It's less confusing if we wait until the Shield is broken
			// before tossing the coin, it would work without using onAttack first
			// because we also check on followup but it would be confusing to win
			// the coin toss and then not get the card, having said that this won't
			// work for Loyalty and Totem because they get discarded onHermitDeath
			// not sure what to do about that, in theory I could toss the coin on the
			// follow up but the modal will appear before the coin toss ¯\_(ツ)_/¯
			player.hooks.afterAttack[instance] = (attackResult) => {
				const {attack} = attackResult

				if (attack.id !== this.getInstanceKey(instance)) return
				delete player.hooks.afterAttack[instance]

				if (attack.type !== 'primary') return
				if (!attack.target.row.effectCard) return

				const opponentEffectCard = attack.target.row.effectCard
				if (!opponentEffectCard || !isRemovable(opponentEffectCard)) return

				// If everyone is alive, before the decription changed you could steal
				// the effect card if the opposite hermit died, now you can't because
				// the coin toss happens after the attack.
				if (
					attack.attacker &&
					attack.attacker.row.health &&
					attack.target.row.health
				) {
					const coinFlip = flipCoin(player, this.id)
					player.coinFlips[this.id] = coinFlip
					if (coinFlip[0] === 'tails') return

					player.custom[key] = opponentEffectCard
					player.followUp = this.id
				}
			}
		}

		player.hooks.onFollowUp[instance] = (
			followUp,
			pickedCards,
			modalResult
		) => {
			if (followUp !== this.id) return
			player.followUp = null

			/** @type {CardT | undefined} */
			const opponentEffectCard = player.custom[key]
			delete player.custom[key]
			if (!opponentEffectCard) return

			const effectCardPos = getCardPos(game, opponentEffectCard.cardInstance)
			if (!effectCardPos || !effectCardPos.row) return

			if (modalResult.attach) {
				if (row?.effectCard) {
					discardCard(game, row.effectCard)
					row.effectCard = opponentEffectCard
					effectCardPos.row.effectCard = null
				}
			} else {
				// The card gets discarded to your discard pile so we can't use discardCard
				effectCardPos.row.effectCard = null
				player.discarded.push({
					cardId: opponentEffectCard.cardId,
					cardInstance: opponentEffectCard.cardInstance,
				})
			}
		}

		player.hooks.onFollowUpTimeout[instance] = (followUp) => {
			if (followUp !== this.id) return
			const opponentEffectCard = player.custom[key]
			if (!opponentEffectCard) return

			player.followUp = null
			const effectCardPos = getCardPos(game, opponentEffectCard.cardInstance)
			if (!effectCardPos || !effectCardPos.row) return

			// Discard the card if the player didn't choose
			effectCardPos.row.effectCard = null
			player.discarded.push({
				cardId: opponentEffectCard.cardId,
				cardInstance: opponentEffectCard.cardInstance,
			})
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player} = pos
		delete player.hooks.onAttack[instance]
		delete player.hooks.onFollowUp[instance]
		delete player.custom[this.getInstanceKey(instance)]
	}
}

export default GrianRareHermitCard
