import {CARDS} from '..'
import {CardPosModel, getCardPos} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {SlotPos} from '../../types/cards'
import {CardT} from '../../types/game-state'
import {getActiveRowPos} from '../../utils/board'
import {equalCard, isRemovable} from '../../utils/cards'
import {flipCoin} from '../../utils/coinFlips'
import {discardCard, swapSlots} from '../../utils/movement'
import HermitCard from '../base/hermit-card'

// The tricky part about this one are destroyable items (shield, totem, loyalty) since they are available at the moment of attack, but not after

/*
Some assumptions that make sense to me:
- Shield can't be stolen as they get used up during the attack
- If hermitMultiplier is 0 (e.g. invis potion), then shield don't get used and so you can steal it
- Totem/Loyalty can be stolen unless it was used
- If you choose to discard the card it gets discarded to your discard pile
*/

class GrianRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'grian_rare',
			numericId: 35,
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

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer, row} = pos

		player.hooks.afterAttack.add(instance, (attack) => {
			if (attack.id !== this.getInstanceKey(instance)) return
			if (attack.type !== 'primary') return

			const coinFlip = flipCoin(player, this.id)

			if (coinFlip[0] === 'tails') return

			const opponentRowPos = getActiveRowPos(opponentPlayer)
			if (!row || !opponentRowPos) return

			const opponentEffectCard = opponentRowPos.row.effectCard
			if (!opponentEffectCard || !isRemovable(opponentEffectCard)) return

			// Discard straight away
			discardCard(game, opponentEffectCard, true)

			if (!row.effectCard) {
				// But remove it from our discard pile for now
				player.discarded = player.discarded.filter((c) => !equalCard(c, opponentEffectCard))
			} else {
				// We already have an effect card, so we just leave it in our discard
				return
			}

			player.modalRequests.push({
				id: this.id,
				onResult(modalResult) {
					if (!modalResult || modalResult.attach === undefined) return 'FAILURE_INVALID_DATA'

					if (modalResult.attach) {
						// Discard our current attached card if there is one
						if (row?.effectCard) {
							discardCard(game, row.effectCard)
						}

						// Manually attach the new effect card to ourselves
						row.effectCard = opponentEffectCard

						// Call onAttach
						const cardInfo = CARDS[opponentEffectCard.cardId]
						cardInfo.onAttach(game, opponentEffectCard.cardInstance, pos)
						player.hooks.onAttach.call(opponentEffectCard.cardInstance)
					} else {
						// Add it to our discard pile
						player.discarded.push(opponentEffectCard)
					}

					return 'SUCCESS'
				},
				onTimeout() {
					// Just add the card to our discard pile
					player.discarded.push(opponentEffectCard)
				},
			})
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.afterAttack.remove(instance)
	}
}

export default GrianRareHermitCard
