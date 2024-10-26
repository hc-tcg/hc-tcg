import {CardComponent, ObserverComponent} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import {flipCoin} from '../../../utils/coinFlips'
import {attach} from '../../base/defaults'
import {Attach} from '../../base/types'

const BrewingStand: Attach = {
	...attach,
	id: 'brewing_stand',
	numericId: 201,
	name: 'Brewing stand',
	expansion: 'advent_of_tcg',
	rarity: 'rare',
	tokens: 1,
	description:
		'At the start of every turn where this Hermit is active, flip a coin. If heads, discard an item card attached to this Hermit and heal by 50hp.',
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		observer.subscribe(player.hooks.onTurnStart, () => {
			if (!component.slot.inRow() || component.slot.row.getItems().length === 0)
				return

			if (component.slot.row.entity !== player.activeRowEntity) return

			const flip = flipCoin(player, component)[0]
			if (flip !== 'heads') return

			game.addPickRequest({
				player: player.entity,
				id: component.entity,
				message: 'Pick an item card to discard',
				canPick: query.every(
					query.slot.currentPlayer,
					query.slot.item,
					query.not(query.slot.empty),
					query.slot.active,
				),
				onResult(pickedSlot) {
					if (!pickedSlot.inRow()) return

					pickedSlot.row.heal(50)
					pickedSlot.getCard()?.discard()
				},
			})
		})
	},
}

export default BrewingStand
