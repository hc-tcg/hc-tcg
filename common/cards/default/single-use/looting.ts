import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {getActiveRow} from '../../../utils/board'
import {flipCoin} from '../../../utils/coinFlips'
import {moveCardToHand} from '../../../utils/movement'
import SingleUseCard from '../../base/single-use-card'

class LootingSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'looting',
			numericId: 76,
			name: 'Looting',
			rarity: 'rare',
			description:
				'Flip a coin. If heads, pick 1 item card from opposing active Hermit and add it to your hand.',
		})
	}

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
				onResult(pickResult) {
					if (pickResult.playerId !== opponentPlayer.id) return 'FAILURE_WRONG_PLAYER'
					if (pickResult.rowIndex !== opponentPlayer.board.activeRow) return 'FAILURE_INVALID_SLOT'

					if (pickResult.slot.type !== 'item') return 'FAILURE_INVALID_SLOT'
					if (!pickResult.card) return 'FAILURE_INVALID_SLOT'

					const playerRow = player.board.rows[pickResult.rowIndex]
					const hermitCard = playerRow.hermitCard
					if (!hermitCard || !playerRow.health) return 'SUCCESS'
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

	override canAttach(game: GameModel, pos: CardPosModel) {
		const canAttach = super.canAttach(game, pos)
		if (canAttach !== 'YES') return canAttach
		const {opponentPlayer} = pos
		const opponentActiveRow = getActiveRow(opponentPlayer)
		if (!opponentActiveRow) return 'NO'

		const noItems = opponentActiveRow.itemCards.every((card) => card === null)

		if (noItems) return 'NO'

		return 'YES'
	}
}

export default LootingSingleUseCard
