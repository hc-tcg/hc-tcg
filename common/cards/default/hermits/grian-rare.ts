import {CARDS} from '../..'
import {CardPosModel, getCardPos} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {getActiveRowPos, getSlotPos} from '../../../utils/board'
import {isRemovable} from '../../../utils/cards'
import {flipCoin} from '../../../utils/coinFlips'
import {canAttachToSlot, discardCard, swapSlots} from '../../../utils/movement'
import HermitCard from '../../base/hermit-card'

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
					"After your attack, flip a coin.\nIf heads, steal the attached effect card of your opponent's active Hermit, and then choose to attach or discard it.",
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
		const {player, opponentPlayer, rowIndex, row} = pos

		player.hooks.afterAttack.add(instance, (attack) => {
			if (attack.id !== this.getInstanceKey(instance)) return
			const attacker = attack.getAttacker()
			if (attack.type !== 'primary' || !attacker) return

			const opponentRowPos = getActiveRowPos(opponentPlayer)
			if (rowIndex === null || !row || !opponentRowPos) return

			const opponentEffectCard = opponentRowPos.row.effectCard
			if (!opponentEffectCard || !isRemovable(opponentEffectCard)) return

			const coinFlip = flipCoin(player, attacker.row.hermitCard)

			if (coinFlip[0] === 'tails') return

			const effectSlot = getSlotPos(player, rowIndex, 'effect')
			const canAttachResult = canAttachToSlot(game, effectSlot, opponentEffectCard, true)

			if (canAttachResult.length > 0) {
				// We can't attach the new card, don't bother showing a modal
				discardCard(game, opponentEffectCard, player)
				return
			}

			game.addModalRequest({
				playerId: player.id,
				data: {modalId: this.id},
				onResult(modalResult) {
					if (!modalResult || modalResult.attach === undefined) return 'FAILURE_INVALID_DATA'

					if (modalResult.attach) {
						// Discard our current attached card if there is one
						discardCard(game, row.effectCard)

						// Move their effect card over
						const opponentEffectSlot = getSlotPos(opponentPlayer, opponentRowPos.rowIndex, 'effect')
						swapSlots(game, effectSlot, opponentEffectSlot)

						const newPos = getCardPos(game, opponentEffectCard.cardInstance)

						if (newPos) {
							// Call onAttach
							const cardInfo = CARDS[opponentEffectCard.cardId]
							cardInfo.onAttach(game, opponentEffectCard.cardInstance, newPos)
							player.hooks.onAttach.call(opponentEffectCard.cardInstance)
						}
					} else {
						// Discard
						discardCard(game, opponentEffectCard, player)
					}

					return 'SUCCESS'
				},
				onTimeout() {
					// Discard
					discardCard(game, opponentEffectCard, player)
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
