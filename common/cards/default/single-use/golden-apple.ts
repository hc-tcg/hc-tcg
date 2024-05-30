import SingleUseCard from '../../base/single-use-card'
import {HERMIT_CARDS} from '../..'
import {GameModel} from '../../../models/game-model'
import {CardPosModel} from '../../../models/card-pos-model'
import {hasActive} from '../../../utils/game'
import {applySingleUse, getNonEmptyRows} from '../../../utils/board'

class GoldenAppleSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'golden_apple',
			numericId: 30,
			name: 'Golden Apple',
			rarity: 'ultra_rare',
			description: 'Heal one of your AFK Hermits 100hp.',
			log: (values) => `${values.defaultLog} on $p${values.pick.name}$ and healed $g100hp$`,
		})
	}

	override canAttach(game: GameModel, pos: CardPosModel) {
		const result = super.canAttach(game, pos)

		const {player} = pos

		// Need active hermit to play
		if (!hasActive(player)) result.push('UNMET_CONDITION')

		// Can't attach it there are not any inactive hermits
		const playerHasAfk = getNonEmptyRows(player, true).some(
			(rowPos) => HERMIT_CARDS[rowPos.row.hermitCard.cardId] !== undefined
		)
		if (!playerHasAfk) result.push('UNMET_CONDITION')

		return result
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		game.addPickRequest({
			playerId: player.id,
			id: this.id,
			message: 'Pick one of your AFK Hermits',
			onResult(pickResult) {
				if (pickResult.playerId !== player.id) return 'FAILURE_INVALID_PLAYER'

				const rowIndex = pickResult.rowIndex
				if (rowIndex === undefined) return 'FAILURE_INVALID_SLOT'
				if (rowIndex === player.board.activeRow) return 'FAILURE_INVALID_SLOT'
				const row = player.board.rows[rowIndex]
				if (!row || !row.health) return 'FAILURE_INVALID_SLOT'

				if (pickResult.slot.type !== 'hermit') return 'FAILURE_INVALID_SLOT'
				if (!pickResult.card) return 'FAILURE_INVALID_SLOT'

				const hermitInfo = HERMIT_CARDS[pickResult.card.cardId]
				if (!hermitInfo) return 'FAILURE_CANNOT_COMPLETE'

				// Apply
				applySingleUse(game, pickResult)

				const maxHealth = Math.max(row.health, hermitInfo.health)
				row.health = Math.min(row.health + 100, maxHealth)

				return 'SUCCESS'
			},
		})
	}
}

export default GoldenAppleSingleUseCard
