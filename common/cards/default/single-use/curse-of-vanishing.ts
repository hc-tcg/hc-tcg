import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {slot} from '../../../slot'
import {discardCard} from '../../../utils/movement'
import SingleUseCard from '../../base/single-use-card'

class CurseOfVanishingSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'curse_of_vanishing',
			numericId: 12,
			name: 'Curse Of Vanishing',
			rarity: 'common',
			description: 'Your opponent must discard any effect card attached to their active Hermit.',
		})
	}

	discardCondition = slot.every(
		slot.opponent,
		slot.activeRow,
		slot.effectSlot,
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
}

export default CurseOfVanishingSingleUseCard
