import {GameModel} from '../../../models/game-model'
import {query, slot} from '../../../components/query'
import {CardComponent} from '../../../components'
import {flipCoin} from '../../../utils/coinFlips'
import {moveCardInstanceoHand} from '../../../utils/movement'
import Card from '../../base/card'
import {SingleUse} from '../../base/types'
import {singleUse} from '../../base/defaults'

class LootingSingleUseCard extends Card {
	pickCondition = query.every(slot.opponent, slot.activeRow, slot.itemSlot, query.not(slot.empty))

	props: SingleUse = {
		...singleUse,
		id: 'looting',
		numericId: 76,
		name: 'Looting',
		expansion: 'default',
		rarity: 'rare',
		tokens: 1,
		description:
			"Flip a coin.\nIf heads, choose one item card attached to your opponent's active Hermit and add it to your hand.",
		showConfirmationModal: true,
		attachCondition: query.every(
			singleUse.attachCondition,
			slot.someSlotFulfills(this.pickCondition)
		),
		log: (values) => `${values.defaultLog}, and ${values.coinFlip}`,
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player, opponentPlayer} = pos

		player.hooks.onApply.add(component, () => {
			const coinFlip = flipCoin(player, component)

			if (coinFlip[0] === 'tails') return

			game.addPickRequest({
				playerId: player.id,
				id: this.props.id,
				message: 'Pick an item card to add to your hand',
				canPick: this.pickCondition,
				onResult(pickedSlot) {
					if (pickedSlot.rowIndex === null || pickedSlot.cardId === null) {
						return
					}

					const playerRow = opponentPlayer.board.rows[pickedSlot.rowIndex]
					const hermitCard = playerRow.hermitCard
					if (!hermitCard || !playerRow.health) return
					moveCardInstanceoHand(game, pickedSlot.cardId, player)
				},
			})
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = component
		player.hooks.onApply.remove(component)
	}
}

export default LootingSingleUseCard
