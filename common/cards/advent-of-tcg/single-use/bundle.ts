import {
	CardComponent,
	DeckSlotComponent,
	HandSlotComponent,
	ObserverComponent,
	PlayerComponent,
	SlotComponent,
	StatusEffectComponent,
} from '../../../components'
import query from '../../../components/query'
import {PlayerEntity} from '../../../entities'
import {GameModel} from '../../../models/game-model'
import BundledStatusEffect from '../../../status-effects/bundled'
import {applyCard, applySingleUse} from '../../../utils/board'
import {singleUse} from '../../defaults'
import {SingleUse} from '../../types'
import FullBundle from './full_bundle'

const singleUseHandQuery = (player: PlayerEntity) =>
	query.every(
		query.card.isSingleUse,
		query.card.slot(query.slot.hand),
		query.card.player(player),
	)

const Bundle: SingleUse = {
	...singleUse,
	id: 'bundle',
	numericId: 225,
	name: 'Bundle',
	expansion: 'advent_of_tcg',
	rarity: 'rare',
	tokens: 0,
	description:
		'Bundle two single use cards into a full bundle. Full bundle can be used on your next turn to play both single use cards.',
	attachCondition: query.every(
		singleUse.attachCondition,
		(game, pos) =>
			game.components.filter(
				CardComponent<SingleUse>,
				singleUseHandQuery(pos.player.entity),
			).length >= 2,
	),
	log: (values) => values.defaultLog,
	onAttach(
		game: GameModel,
		component: CardComponent,
		_observer: ObserverComponent,
	) {
		const {player} = component

		const singleUses = game.components.filterEntities(
			CardComponent<SingleUse>,
			singleUseHandQuery(player.entity),
		)

		game.addModalRequest({
			player: player.entity,
			modal: {
				type: 'selectCards',
				name: 'Bundle',
				description: 'Select two cards to bundle together.',
				cards: singleUses,
				selectionSize: 2,
				cancelable: true,
				primaryButton: {
					text: 'Confirm',
					variant: 'primary',
				},
			},
			onResult: (result) => {
				if (!result.result) return
				if (!result.cards) return
				if (result.cards.length !== 2) return

                const handSlot = game.components.new(
                    HandSlotComponent,
                    player.entity,
                )
                const fullBundle = game.components.new(CardComponent, FullBundle, handSlot.entity)

				result.cards.forEach((card) => {
                    card.discard()
					game.components
						.new(StatusEffectComponent, BundledStatusEffect, fullBundle.entity)
						.apply(card.entity)
				})
                applySingleUse(game)
			},
			onTimeout: () => {},
		})
	},
}

export default Bundle
