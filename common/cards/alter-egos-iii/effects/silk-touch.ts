import {GameModel} from '../../../models/game-model'
import {
	CardComponent,
	DeckSlotComponent,
	ObserverComponent,
} from '../../../components'
import {Attach} from '../../base/types'
import {attach} from '../../base/defaults'
import query from '../../../components/query'

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
