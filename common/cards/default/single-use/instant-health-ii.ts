import SingleUseCard from '../../base/single-use-card'
import {HERMIT_CARDS} from '../..'
import {GameModel} from '../../../models/game-model'
import {CardPosModel} from '../../../models/card-pos-model'
import {applySingleUse, getNonEmptyRows} from '../../../utils/board'
import {slot} from '../../../slot'

class InstantHealthIISingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'instant_health_ii',
			numericId: 43,
			name: 'Instant Health II',
			rarity: 'rare',
			description: 'Heal one of your Hermits 60hp.',
			log: (values) => `${values.defaultLog} on $p${values.pick.name}$ and healed $g60hp$`,
		})
	}

	override _attachCondition = slot.every(
		super.attachCondition,
		slot.playerHasActiveHermit,
		(game, pos) =>
			getNonEmptyRows(pos.player).some(
				(rowPos) => HERMIT_CARDS[rowPos.row.hermitCard.cardId] !== undefined
			)
	)

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		game.addPickRequest({
			playerId: player.id,
			id: this.id,
			message: 'Pick an active or AFK Hermit',
			canPick: slot.every(slot.not(slot.empty), slot.hermitSlot),
			onResult(pickResult) {
				const rowIndex = pickResult.rowIndex
				if (!pickResult.card || rowIndex === undefined) return 'FAILURE_INVALID_SLOT'

				const row = player.board.rows[rowIndex]
				if (!row.health) return 'FAILURE_INVALID_SLOT'

				const hermitInfo = HERMIT_CARDS[pickResult.card.cardId]
				if (!hermitInfo) return 'FAILURE_CANNOT_COMPLETE'

				// Apply
				applySingleUse(game, pickResult)

				const maxHealth = Math.max(row.health, hermitInfo.health)
				row.health = Math.min(row.health + 60, maxHealth)

				return 'SUCCESS'
			},
		})
	}
}

export default InstantHealthIISingleUseCard
