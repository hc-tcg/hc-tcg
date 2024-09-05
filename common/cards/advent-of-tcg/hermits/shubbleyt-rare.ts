import {
	CardComponent,
	DeckSlotComponent,
	ObserverComponent,
} from '../../../components'
import {GameModel} from '../../../models/game-model'
import {afterAttack} from '../../../types/priorities'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

const ShubbleYTRare: Hermit = {
	...hermit,
	id: 'shubbleyt_rare',
	numericId: 217,
	name: 'Shelby',
	expansion: 'advent_of_tcg',
	palette: 'advent_of_tcg',
	background: 'advent_of_tcg',
	rarity: 'rare',
	tokens: 1,
	type: 'terraform',
	health: 300,
	primary: {
		name: 'Good Witch',
		cost: ['terraform'],
		damage: 50,
		power: null,
	},
	secondary: {
		name: 'Parallel World',
		cost: ['terraform', 'terraform'],
		damage: 80,
		power:
			'After your attack, view the top card of your deck. You may choose to place it on the bottom of your deck.',
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	): void {
		const {player} = component

		observer.subscribeWithPriority(
			player.hooks.afterAttack,
			afterAttack.HERMIT_ATTACK_REQUESTS,
			(attack) => {
				if (!attack.isAttacker(component.entity)) return
				if (attack.type !== 'secondary') return
				const topCard = player.getDeck().sort(CardComponent.compareOrder).at(0)
				if (!topCard) return

				game.addModalRequest({
					player: player.entity,
					modal: {
						type: 'selectCards',

						name: 'Shelby - Parallel World',
						description: 'Place your top card on bottom of deck?',
						cards: [topCard.entity],
						selectionSize: 0,
						cancelable: false,
						primaryButton: {
							text: 'Place on Bottom',
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

						topCard.attach(
							game.components.new(DeckSlotComponent, player.entity, {
								position: 'back',
							}),
						)

						return 'SUCCESS'
					},
					onTimeout() {},
				})
			},
		)
	},
}

export default ShubbleYTRare
