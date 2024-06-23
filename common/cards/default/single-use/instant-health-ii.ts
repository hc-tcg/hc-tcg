import SingleUseCard from '../../base/single-use-card'
import {HERMIT_CARDS} from '../..'
import {GameModel} from '../../../models/game-model'
import {CardPosModel} from '../../../models/card-pos-model'
import {applySingleUse} from '../../../utils/board'
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
			onResult(pickResult) {
				const rowIndex = pickResult.rowIndex
				if (!pickResult.card || rowIndex === null) return

				const row = player.board.rows[rowIndex]
				if (!row.health) return

				const hermitInfo = HERMIT_CARDS[pickResult.card.cardId]
				if (!hermitInfo) return

				// Apply
				applySingleUse(game, pickResult)

				const maxHealth = Math.max(row.health, hermitInfo.health)
				row.health = Math.min(row.health + 60, maxHealth)
			},
		})
	}
}

export default InstantHealthIISingleUseCard
