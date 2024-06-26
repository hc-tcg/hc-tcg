import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {slot} from '../../../slot'
import {flipCoin} from '../../../utils/coinFlips'
import {moveCardInstanceoHand} from '../../../utils/movement'
import SingleUseCard from '../../base/single-use-card'

class LootingSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'looting',
			numericId: 76,
			name: 'Looting',
			rarity: 'rare',
			description:
				"Flip a coin.\nIf heads, choose one item card attached to your opponent's active Hermit and add it to your hand.",
			log: (values) => `${values.defaultLog}, and ${values.coinFlip}`,
		})
	}

	pickCondition = slot.every(slot.opponent, slot.activeRow, slot.itemSlot, slot.not(slot.empty))

	override _attachCondition = slot.every(
		super.attachCondition,
		slot.someSlotFulfills(this.pickCondition)
	)

	override canApply() {
		return true
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos

		player.hooks.onApply.add(instance, () => {
			const coinFlip = flipCoin(player, {
				cardId: this.id,
				cardInstance: instance,
			})

			if (coinFlip[0] === 'tails') return

			game.addPickRequest({
				playerId: player.id,
				id: this.id,
				message: 'Pick an item card to add to your hand',
				canPick: this.pickCondition,
				onResult(pickedSlot) {
					if (pickedSlot.rowIndex === null || pickedSlot.card === null) {
						return
					}

					const playerRow = opponentPlayer.board.rows[pickedSlot.rowIndex]
					const hermitCard = playerRow.hermitCard
					if (!hermitCard || !playerRow.health) return
					moveCardInstanceoHand(game, pickedSlot.card, player)
				},
			})
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onApply.remove(instance)
	}
}

export default LootingSingleUseCard
