import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import CatGiftEffect from '../../../status-effects/cat-gift'
import {afterAttack} from '../../../types/priorities'
import {attach} from '../../base/defaults'
import {Attach} from '../../base/types'

const Cat: Attach = {
	...attach,
	id: 'cat',
	numericId: 202,
	name: 'Cat',
	expansion: 'advent_of_tcg',
	rarity: 'rare',
	tokens: 1,
	description:
		'After the Hermit this card is attached to attacks, view the top card of your deck. You may choose to draw the bottom card of your deck at the end of your turn instead.',
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component
		observer.subscribeWithPriority(
			game.hooks.afterAttack,
			afterAttack.EFFECT_POST_ATTACK_REQUESTS,
			(attack) => {
				if (!component.slot.inRow()) return
				if (!attack.isAttacker(component.slot.row.getHermit()?.entity)) return

				if (
					game.components.exists(
						CardComponent,
						query.card.slot(query.slot.currentPlayer, query.slot.deck),
					)
				)
					return

				game.addModalRequest({
					player: player.entity,
					modal: {
						type: 'selectCards',
						name: 'Cat',
						description: 'Draw a card from the bottom of your deck?',
						cards: [
							player.getDeck().sort(CardComponent.compareOrder)[0].entity,
						],
						selectionSize: 0,
						cancelable: false,
						primaryButton: {
							text: 'Draw from Bottom',
							variant: 'primary',
						},
						secondaryButton: {
							text: 'Do Nothing',
							variant: 'secondary',
						},
					},
					onResult(modalResult) {
						if (!modalResult) return 'SUCCESS'
						if (!modalResult.result) return 'SUCCESS'

						game.components
							.new(StatusEffectComponent, CatGiftEffect, component.entity)
							.apply(player.entity)

						return 'SUCCESS'
					},
					onTimeout() {},
				})
			},
		)
	},
}

export default Cat
