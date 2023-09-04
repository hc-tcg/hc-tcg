import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {equalCard} from '../../utils/cards'
import {discardFromHand, drawCards} from '../../utils/movement'
import SingleUseCard from '../base/single-use-card'

class ComposterSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'composter',
			numericId: 7,
			name: 'Composter',
			rarity: 'common',
			description:
				'Discard 2 cards in your hand. Draw 2.\n\nCan not be used if you do not have 2 cards to discard.',

			pickOn: 'apply',
			pickReqs: [
				{
					target: 'player',
					slot: ['hand'],
					amount: 2,
				},
			],
		})
	}

	override canAttach(game: GameModel, pos: CardPosModel) {
		const canAttach = super.canAttach(game, pos)
		if (canAttach !== 'YES') return canAttach

		const {player} = pos
		if (player.hand.length < 2) return 'NO'

		return 'YES'
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.onApply.add(instance, (pickedSlots, modalResult) => {
			const slots = pickedSlots[this.id] || []

			if (slots.length !== 2) return

			const pickedCard1 = slots[0]
			const pickedCard2 = slots[1]

			if (pickedCard1.slot.card === null || pickedCard2.slot.card === null) return

			// @TODO Check on ValidPicks instead
			if (equalCard(pickedCard1.slot.card, pickedCard2.slot.card)) return

			const player = game.state.players[pickedCard1.playerId]

			discardFromHand(player, pickedCard1.slot.card)
			discardFromHand(player, pickedCard2.slot.card)

			drawCards(player, 2)
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onApply.remove(instance)
	}
}

export default ComposterSingleUseCard
