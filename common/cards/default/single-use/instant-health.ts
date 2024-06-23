import SingleUseCard from '../../base/single-use-card'
import {HERMIT_CARDS} from '../..'
import {GameModel} from '../../../models/game-model'
import {CardPosModel} from '../../../models/card-pos-model'
import {applySingleUse} from '../../../utils/board'
import {slot} from '../../../slot'

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

	pickCondition = slot.every(
		slot.hermitSlot,
		// @todo Fix this by giving armor stand support for health
		slot.not(slot.hasId('armor_stand')),
		slot.not(slot.empty)
	)

	override _attachCondition = slot.every(
		super.attachCondition,
		slot.playerHasActiveHermit,
		slot.someSlotFulfills(this.pickCondition)
	)

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		game.addPickRequest({
			playerId: player.id,
			id: this.id,
			message: 'Pick an active or AFK Hermit',
			canPick: this.pickCondition,
			onResult(pickedSlot) {
				const rowIndex = pickedSlot.rowIndex
				if (!pickedSlot.card || rowIndex === null) return

				const row = player.board.rows[rowIndex]
				if (!row.health) return

				const hermitInfo = HERMIT_CARDS[pickedSlot.card.cardId]
				if (!hermitInfo) return

				// Apply
				applySingleUse(game, pickedSlot)

				const maxHealth = Math.max(row.health, hermitInfo.health)
				row.health = Math.min(row.health + 30, maxHealth)
			},
		})
	}
}

export default InstantHealthSingleUseCard
