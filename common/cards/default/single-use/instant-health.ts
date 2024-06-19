import SingleUseCard from '../../base/single-use-card'
import {HERMIT_CARDS} from '../..'
import {GameModel} from '../../../models/game-model'
import {CardPosModel} from '../../../models/card-pos-model'
import {applySingleUse, getNonEmptyRows} from '../../../utils/board'
import {slot} from '../../../slot'

const pickCondition = slot.every(slot.not(slot.empty), slot.hermitSlot)

class InstantHealthSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'instant_health',
			numericId: 42,
			name: 'Instant Health',
			rarity: 'common',
			description: 'Heal one of your Hermits 30hp.',
			log: (values) => `${values.defaultLog} on $p${values.pick.name}$ and healed $g30hp$`,
		})
	}

	override _attachCondition = slot.every(
		super.attachCondition,
		slot.playerHasActiveHermit,
		slot.someSlotFulfills(pickCondition)
	)

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		game.addPickRequest({
			playerId: player.id,
			id: this.id,
			message: 'Pick an active or AFK Hermit',
			canPick: pickCondition,
			onResult(pickResult) {
				const rowIndex = pickResult.rowIndex
				if (!pickResult.card || rowIndex === undefined) return

				const row = player.board.rows[rowIndex]
				if (!row.health) return

				const hermitInfo = HERMIT_CARDS[pickResult.card.cardId]
				if (!hermitInfo) return

				// Apply
				applySingleUse(game, pickResult)

				const maxHealth = Math.max(row.health, hermitInfo.health)
				row.health = Math.min(row.health + 30, maxHealth)
			},
		})
	}
}

export default InstantHealthSingleUseCard
