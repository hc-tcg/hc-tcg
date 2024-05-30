import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
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

	override canApply() {
		return true
	}

	override canAttach(game: GameModel, pos: CardPosModel): CanAttachResult {
		const result = super.canAttach(game, pos)

		const {opponentPlayer} = pos
		const opponentActiveRow = getActiveRow(opponentPlayer)
		if (!opponentActiveRow || isRowEmpty(opponentActiveRow)) result.push('UNMET_CONDITION')

		return result
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
				onResult(pickResult) {
					if (pickResult.playerId !== opponentPlayer.id) return 'FAILURE_INVALID_PLAYER'
					if (pickResult.rowIndex !== opponentPlayer.board.activeRow) return 'FAILURE_INVALID_SLOT'

					if (pickResult.slot.type !== 'item') return 'FAILURE_INVALID_SLOT'
					if (!pickResult.card) return 'FAILURE_INVALID_SLOT'

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
