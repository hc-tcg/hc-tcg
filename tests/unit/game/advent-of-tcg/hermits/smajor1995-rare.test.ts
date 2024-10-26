import {describe, expect, test} from '@jest/globals'
import Smajor1995Rare from 'common/cards/advent-of-tcg/hermits/smajor1995'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import VintageBeefCommon from 'common/cards/default/hermits/vintagebeef-common'
import BalancedItem from 'common/cards/default/items/balanced-common'
import BuilderDoubleItem from 'common/cards/default/items/builder-rare'
import {StatusEffectComponent} from 'common/components'
import query from 'common/components/query'
import DyedEffect from 'common/status-effects/dyed'
import {
	attack,
	changeActiveHermit,
	endTurn,
	pick,
	playCardFromHand,
	testGame,
} from '../../utils'

describe('Test Scott "To Dye For"', () => {
	test('"To Dye For" functionality', () => {
		testGame({
			playerOneDeck: [
				Smajor1995Rare,
				VintageBeefCommon,
				...Array(3).fill(BuilderDoubleItem),
			],
			playerTwoDeck: [EthosLabCommon, ...Array(3).fill(BalancedItem)],
			saga: function* (game) {
				yield* playCardFromHand(game, Smajor1995Rare, 'hermit', 0)
				yield* playCardFromHand(game, VintageBeefCommon, 'hermit', 1)
				yield* playCardFromHand(game, BuilderDoubleItem, 'item', 0, 0)
				yield* endTurn(game)

				yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
				yield* playCardFromHand(game, BalancedItem, 'item', 0, 0)
				yield* attack(game, 'primary')
				yield* endTurn(game)

				yield* playCardFromHand(game, BuilderDoubleItem, 'item', 0, 1)
				yield* attack(game, 'secondary')
				yield* pick(
					game,
					query.slot.currentPlayer,
					query.slot.hermit,
					query.slot.rowIndex(1),
				)
				expect(
					game.components.find(
						StatusEffectComponent,
						query.effect.is(DyedEffect),
						query.effect.targetIsCardAnd(
							query.card.currentPlayer,
							query.card.slot(query.slot.hermit, query.slot.rowIndex(1)),
						),
					),
				).not.toBe(null)
				yield* endTurn(game)

				yield* playCardFromHand(game, BalancedItem, 'item', 0, 1)
				yield* attack(game, 'primary')
				yield* endTurn(game)

				yield* playCardFromHand(game, BuilderDoubleItem, 'item', 1, 1)
				yield* attack(game, 'secondary')
				expect(game.state.pickRequests).toHaveLength(0)
				yield* endTurn(game)

				yield* playCardFromHand(game, BalancedItem, 'item', 0, 2)
				yield* attack(game, 'secondary')
				yield* endTurn(game)

				yield* endTurn(game)

				yield* attack(game, 'secondary')
				yield* endTurn(game)

				yield* changeActiveHermit(game, 1)
				yield* attack(game, 'secondary')
				expect(
					game.components.find(
						StatusEffectComponent,
						query.effect.is(DyedEffect),
						query.effect.targetIsCardAnd(
							query.card.currentPlayer,
							query.card.slot(query.slot.hermit, query.slot.rowIndex(1)),
						),
					),
				).not.toBe(null)
			},
		})
	})
})
