import {GameModel} from '../../../models/game-model'
import {query, slot} from '../../../components/query'
import {CardComponent, SlotComponent} from '../../../components'
import {applySingleUse} from '../../../utils/board'
import Card from '../../base/card'
import {SingleUse} from '../../base/types'
import {singleUse} from '../../base/defaults'

class ComposterSingleUseCard extends Card {
	props: SingleUse = {
		...singleUse,
		id: 'composter',
		numericId: 7,
		name: 'Composter',
		expansion: 'default',
		rarity: 'common',
		tokens: 0,
		description:
			'Discard 2 cards in your hand. Draw 2.\nCan not be used if you do not have 2 cards to discard.',
		log: (values) => `${values.defaultLog} to discard 2 cards and draw 2 cards`,
		attachCondition: query.every(
			singleUse.attachCondition,
			(game, pos) => game.getHand(game.currentPlayer.entity).length >= 2,
			(game, pos) => game.getHand(game.currentPlayer.entity).length > 2
		),
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player} = component

		let firstPickedSlot: SlotComponent | null = null

		game.addPickRequest({
			playerId: player.id,
			id: this.props.id,
			message: 'Pick 2 cards from your hand',
			canPick: slot.hand,
			onResult(pickedSlot) {
				firstPickedSlot = pickedSlot
			},
		})

		game.addPickRequest({
			playerId: player.id,
			id: this.props.id,
			message: 'Pick 1 more card from your hand',
			canPick: (game, pos) => {
				if (firstPickedSlot === null) return false
				return query.every(slot.hand, query.not(slot.entity(firstPickedSlot.entity)))(game, pos)
			},
			onResult(pickedSlot) {
				firstPickedSlot?.getCard()?.discard()
				pickedSlot.getCard()?.discard()

				applySingleUse(game, component.slot)

				game.drawCards(player.entity, 2)
			},
		})
	}
}

export default ComposterSingleUseCard
