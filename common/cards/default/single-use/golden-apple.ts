import SingleUseCard from '../../base/single-use-card'
import {HERMIT_CARDS} from '../..'
import {GameModel} from '../../../models/game-model'
import {CardPosModel} from '../../../models/card-pos-model'
import {applySingleUse} from '../../../utils/board'
import {slot} from '../../../slot'

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

	pickCondition = slot.every(
		slot.hermitSlot,
		// @todo Fix this by giving armor stand support for health
		slot.not(slot.activeRow),
		slot.not(slot.has('armor_stand')),
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
			message: 'Pick one of your AFK Hermits',
			canPick: this.pickCondition,
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
				row.health = Math.min(row.health + 100, maxHealth)
			},
		})
	}
}

export default GoldenAppleSingleUseCard
