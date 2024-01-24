import SingleUseCard from '../../base/single-use-card'
import {HERMIT_CARDS} from '../..'
import {GameModel} from '../../../models/game-model'
import {CardPosModel} from '../../../models/card-pos-model'
import {applySingleUse, getNonEmptyRows} from '../../../utils/board'

class InstantHealthSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'instant_health',
			numericId: 42,
			name: 'Instant Health',
			rarity: 'common',
			description: 'Heal active or AFK Hermit 30hp.',
		})
	}

	override canAttach(game: GameModel, pos: CardPosModel) {
		const canAttach = super.canAttach(game, pos)
		if (canAttach !== 'YES') return canAttach

		const {player} = pos

		// Can't attach it there are no real hermits
		const playerHasHermit = getNonEmptyRows(player).some(
			(rowPos) => HERMIT_CARDS[rowPos.row.hermitCard.cardId] !== undefined
		)
		if (!playerHasHermit) return 'NO'

		return 'YES'
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		game.addPickRequest({
			playerId: player.id,
			id: this.id,
			message: 'Pick an active or AFK Hermit',
			onResult(pickResult) {
				if (pickResult.playerId !== player.id) return 'FAILURE_WRONG_PLAYER'

				const rowIndex = pickResult.rowIndex
				if (rowIndex === undefined) return 'FAILURE_INVALID_SLOT'
				const row = player.board.rows[rowIndex]
				if (!row || !row.health) return 'FAILURE_INVALID_SLOT'

				if (pickResult.slot.type !== 'hermit') return 'FAILURE_INVALID_SLOT'
				if (!pickResult.card) return 'FAILURE_INVALID_SLOT'

				const hermitInfo = HERMIT_CARDS[pickResult.card.cardId]
				if (!hermitInfo) return 'FAILURE_CANNOT_COMPLETE'

				// Apply
				applySingleUse(game)

				row.health = Math.min(row.health + 30, hermitInfo.health)

				return 'SUCCESS'
			},
		})
	}
}

export default InstantHealthSingleUseCard
