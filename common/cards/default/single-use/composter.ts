import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {slot} from '../../../slot'
import {PickRequest} from '../../../types/server-requests'
import {applySingleUse} from '../../../utils/board'
import {equalCard} from '../../../utils/cards'
import {discardFromHand, drawCards} from '../../../utils/movement'
import SingleUseCard from '../../base/single-use-card'

class ComposterSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'composter',
			numericId: 7,
			name: 'Composter',
			rarity: 'common',
			description:
				'Discard 2 cards in your hand. Draw 2.\nCan not be used if you do not have 2 cards to discard.',
			log: (values) => `${values.defaultLog} to discard 2 cards and draw 2 cards`,
		})
	}

	override _attachCondition = slot.every(
		super.attachCondition,
		(game, pos) => pos.player.hand.length >= 2,
		(game, pos) => pos.player.pile.length > 2
	)

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		// Literally just pick requests are needed
		game.addPickRequest({
			playerId: player.id,
			id: this.id,
			message: 'Pick 2 cards from your hand',
			canPick: slot.hand,
			onResult(pickResult) {
				// @TODO right now if one card is discarded then the card won't yet be applied
				//we need a way on the server to highlight certain cards in the hand
				// that way we can not discard until both are selected

				// Discard the card straight away
				discardFromHand(player, pickResult.card)

				return
			},
		})
		game.addPickRequest({
			playerId: player.id,
			id: this.id,
			message: 'Pick 1 more card from your hand',
			canPick: slot.hand,
			onResult(pickResult) {
				discardFromHand(player, pickResult.card)

				// Apply
				applySingleUse(game)

				drawCards(player, 2)

				return
			},
		})
	}
}

export default ComposterSingleUseCard
