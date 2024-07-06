import {GameModel} from '../../../models/game-model'
import {CardPosModel} from '../../../models/card-pos-model'
import {flipCoin} from '../../../utils/coinFlips'
import {discardCard} from '../../../utils/movement'
import {slot} from '../../../slot'
import Card, {Attach, attach} from '../../base/card'
import { CardInstance, healHermit } from '../../../types/game-state'

class BrewingStandEffectCard extends Card {
	props: Attach = {
		...attach,
		id: 'brewing_stand',
		numericId: 201,
		name: 'Brewing stand',
		expansion: 'advent_of_tcg',
		rarity: 'rare',
		tokens: 1,
		description:
			'At the start of every turn where this Hermit is active, flip a coin. If heads, discard an item card attached to this Hermit and heal by 50hp.',
	}

	override onAttach(game: GameModel, instance: CardInstance, pos: CardPosModel) {
		const {player} = pos

		player.hooks.onTurnStart.add(instance, () => {
			if (!pos.row?.itemCards || pos.row.itemCards.filter((card) => card !== null).length === 0)
				return

			if (pos.rowIndex !== player.board.activeRow) return

			const flip = flipCoin(player, instance)[0]
			if (flip !== 'heads') return

			game.addPickRequest({
				playerId: player.id,
				id: this.props.id,
				message: 'Pick an item card to discard',
				canPick: slot.every(
					slot.player,
					slot.itemSlot,
					slot.not(slot.empty),
					slot.rowIndex(pos.rowIndex),
				),
				onResult(pickedSlot) {
					if (!pickedSlot.card || pickedSlot.rowIndex === null) return

					const playerRow = player.board.rows[pickedSlot.rowIndex]
					healHermit(playerRow, 50)
					discardCard(game, pickedSlot.card)
				},
			})
		})
	}

	override onDetach(game: GameModel, instance: CardInstance, pos: CardPosModel) {
		const {player} = pos

		player.hooks.onTurnStart.remove(instance)
	}
}

export default BrewingStandEffectCard
