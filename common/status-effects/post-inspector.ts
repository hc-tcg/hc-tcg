import {Card} from '../cards/types'
import {
	CardComponent,
	ObserverComponent,
	PlayerComponent,
	StatusEffectComponent,
} from '../components'
import {GameModel} from '../models/game-model'
import {SelectCards} from '../types/modal-requests'
import {onTurnEnd} from '../types/priorities'
import {Counter, systemStatusEffect} from './status-effect'

const PostInspectorEffect: Counter<PlayerComponent> = {
	...systemStatusEffect,
	id: 'post_inspector',
	icon: 'post',
	name: "Inspector's pass",
	description:
		'When you draw a card at the end your of the turn, you may shuffle it back into your deck and draw another, once per level of Post inspection.',
	counter: 1,
	counterType: 'number',
	onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		target: PlayerComponent,
		observer: ObserverComponent,
	) {
		const {opponentPlayer} = target

		observer.subscribeWithPriority(
			target.hooks.onTurnEnd,
			onTurnEnd.BEFORE_STATUS_EFFECT_TIMEOUT,
			(drawCards) => {
				if (!drawCards) return
				if (drawCards.length === 0) return
				let chances = effect.counter || 1

				const modalRequest = (cards: (CardComponent<Card> | null)[]) => ({
					player: target.entity,
					modal: {
						type: 'selectCards',
						name: 'Postmaster Pearl - Post inspector',
						description: `Shuffle card${cards.filter((card) => !!card).length === 1 ? '' : 's'} back into the deck?`,
						cards: cards.filter((card) => !!card).map((card) => card?.entity),
						selectionSize: 0,
						cancelable: true,
						primaryButton: {
							text: 'Yes',
							variant: 'default',
						},
						secondaryButton: {
							text: 'No',
							variant: 'default',
						},
					} as SelectCards.Data,
					onResult(result: SelectCards.Result) {
						if (!result) return
						if (!result.result) return
						chances--

						cards.filter((card) => !!card).forEach((card) => card.discard()) // TODO: Replace with shuffle back into deck.

						const newCards = target.draw(cards.length)
						if (chances > 0) game.addModalRequest(modalRequest(newCards))
					},
					onTimeout() {},
				})

				observer.subscribe(opponentPlayer.hooks.onTurnStart, () => {
					game.addModalRequest(modalRequest(drawCards))
					observer.unsubscribe(opponentPlayer.hooks.onTurnStart)
				})
			},
		)
	},
}

export default PostInspectorEffect
