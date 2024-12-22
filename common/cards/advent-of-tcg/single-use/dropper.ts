import {
	CardComponent,
	DeckSlotComponent,
	ObserverComponent,
} from '../../../components'
import {GameModel} from '../../../models/game-model'
import {singleUse} from '../../defaults'
import {SingleUse} from '../../types'
import Feather from './feather'

const Dropper: SingleUse = {
	...singleUse,
	id: 'dropper',
	numericId: 506,
	name: 'Dropper',
	expansion: 'minecraft',
	rarity: 'common',
	tokens: 0,
	description: "Place a feather on the top of your opponent's deck",
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
			game.components.new(CardComponent, Feather, slot.entity)
		})
	},
}

export default Dropper
