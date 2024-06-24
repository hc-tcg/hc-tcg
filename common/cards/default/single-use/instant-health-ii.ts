import SingleUseCard from '../../base/single-use-card'
import {HERMIT_CARDS} from '../..'
import {GameModel} from '../../../models/game-model'
import {CardPosModel} from '../../../models/card-pos-model'
import {applySingleUse} from '../../../utils/board'
import {slot} from '../../../slot'
import { healHermit } from '../../../types/game-state'

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

				// Apply
				applySingleUse(game, pickedSlot)

				healHermit(row, 60)
			},
		})
	}
}

export default InstantHealthIISingleUseCard
