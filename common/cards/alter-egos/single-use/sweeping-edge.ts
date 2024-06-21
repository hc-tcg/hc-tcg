import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {slot} from '../../../slot'
import {discardCard} from '../../../utils/movement'
import SingleUseCard from '../../base/single-use-card'

class SweepingEdgeSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'sweeping_edge',
			numericId: 148,
			name: 'Sweeping Edge',
			rarity: 'ultra_rare',
			description:
				'Your opponent must discard any effect cards attached to their active Hermit and any adjacent Hermits.',
		})
	}

	discardCondition = slot.every(
		slot.some(slot.activeRow, slot.adjacentTo(slot.activeRow)),
		slot.effectSlot,
		slot.opponent,
		slot.not(slot.empty),
		slot.not(slot.frozen)
	)

	override _attachCondition = slot.every(
		super.attachCondition,
		slot.someSlotFulfills(this.discardCondition)
	)

	override canApply() {
		return true
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {opponentPlayer, player} = pos

		player.hooks.onApply.add(instance, () => {
			game
				.filterSlots(this.discardCondition)
				.map((slot) => slot.card && discardCard(game, slot.card))
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onApply.remove(instance)
	}

	override getExpansion() {
		return 'alter_egos'
	}
}

export default SweepingEdgeSingleUseCard
