import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {slot} from '../../../slot'
import {getActiveRow, isRowEmpty} from '../../../utils/board'
import {flipCoin} from '../../../utils/coinFlips'
import {moveCardToHand} from '../../../utils/movement'
import {CanAttachResult} from '../../base/card'
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

	public override canBeAttachedTo = slot.every(super.canBeAttachedTo, (game, pos) => {
		const {opponentPlayer} = game
		const opponentActiveRow = getActiveRow(opponentPlayer)
		return opponentActiveRow !== null && !isRowEmpty(opponentActiveRow)
	})

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
				canPick: slot.every(slot.player, slot.activeRow, slot.itemSlot, slot.not(slot.empty)),
				onResult(pickResult) {
					if (pickResult.rowIndex === undefined || pickResult.card === null) {
						return 'FAILURE_INVALID_SLOT'
					}

					const playerRow = opponentPlayer.board.rows[pickResult.rowIndex]
					const hermitCard = playerRow.hermitCard
					if (!hermitCard || !playerRow.health) return 'FAILURE_INVALID_SLOT'
					moveCardToHand(game, pickResult.card, player)

					return 'SUCCESS'
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
