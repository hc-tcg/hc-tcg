import {
	CardComponent,
	DeckSlotComponent,
	ObserverComponent,
} from '../../../components'
import query from '../../../components/query'
import {currentPlayer} from '../../../components/query/card'
import {GameModel} from '../../../models/game-model'
import {attach} from '../../base/defaults'
import {Attach} from '../../base/types'

const SilkTouch: Attach = {
	...attach,
	id: 'silk_touch',
	numericId: 189,
	name: 'Silk Touch',
	expansion: 'alter_egos_iii',
	rarity: 'rare',
	tokens: 0,
	description:
		'Attach to your active Hermit. If a single use effect card is used while this card is attached to your active Hermit, discard Silk Touch and then shuffle the single use effect card back into your deck.\n This card can not be returned to your hand from your discard pile.',
	onCreate(_game: GameModel, component: CardComponent) {
		component.canBeRecovered = false
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		let singleUseCard: CardComponent | null = null

		observer.subscribe(player.hooks.onApply, () => {
			singleUseCard = game.components.find(
				CardComponent,
				query.card.slot(query.slot.singleUse),
			)
		})

		observer.subscribe(player.hooks.beforeTurnEnd, () => {
			if (
				!component.slot.inRow() ||
				component.slot.row.entity !== player.activeRowEntity
			)
				return
			if (!singleUseCard) return
			if (!singleUseCard.canBeRecovered) return

			singleUseCard.attach(
				game.components.new(DeckSlotComponent, component.player.entity, {
					position: 'random',
				}),
			)

			component.discard()
		})
	},
}

export default SilkTouch
