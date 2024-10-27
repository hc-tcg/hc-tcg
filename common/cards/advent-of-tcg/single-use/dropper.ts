import {
	CardComponent,
	DeckSlotComponent,
	ObserverComponent,
} from '../../../components'
import {GameModel} from '../../../models/game-model'
import {singleUse} from '../../defaults'
import {SingleUse} from '../../types'
import FletchingTable from './fletching-table'

const Dropper: SingleUse = {
	...singleUse,
	id: 'dropper',
	numericId: 222,
	name: 'Dropper',
	expansion: 'advent_of_tcg',
	rarity: 'rare',
	tokens: 0,
	description: "Place a fletching table on the top of your opponent's deck",
	showConfirmationModal: true,
	log: (values) => values.defaultLog,
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	): void {
		const {player, opponentPlayer} = component

		observer.subscribe(player.hooks.onApply, () => {
			let slot = game.components.new(DeckSlotComponent, opponentPlayer.entity, {
				position: 'front',
			})
			game.components.new(CardComponent, FletchingTable, slot.entity)
		})
	},
}

export default Dropper
