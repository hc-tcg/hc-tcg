import {describe, expect, test} from '@jest/globals'
import Smajor1995Rare from 'common/cards/advent-of-tcg/hermits/smajor1995'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import VintageBeefCommon from 'common/cards/hermits/vintagebeef-common'
import BalancedItem from 'common/cards/items/balanced-common'
import BuilderDoubleItem from 'common/cards/items/builder-rare'
import {StatusEffectComponent} from 'common/components'
import query from 'common/components/query'
import DyedEffect from 'common/status-effects/dyed'
import {testGame} from '../../utils'

describe('Test Scott "To Dye For"', () => {
	test('"To Dye For" functionality', async () => {
		await testGame({
			playerOneDeck: [
				Smajor1995Rare,
				VintageBeefCommon,
				...Array(3).fill(BuilderDoubleItem),
			],
			playerTwoDeck: [EthosLabCommon, ...Array(3).fill(BalancedItem)],
			testGame: async (test, game) => {
				await test.playCardFromHand(Smajor1995Rare, 'hermit', 0)
				await test.playCardFromHand(VintageBeefCommon, 'hermit', 1)
				await test.playCardFromHand(BuilderDoubleItem, 'item', 0, 0)
				await test.endTurn()

				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.playCardFromHand(BalancedItem, 'item', 0, 0)
				await test.attack('primary')
				await test.endTurn()

				await test.playCardFromHand(BuilderDoubleItem, 'item', 0, 1)
				await test.attack('secondary')
				await test.pick(
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
				await test.endTurn()

				await test.playCardFromHand(BalancedItem, 'item', 0, 1)
				await test.attack('primary')
				await test.endTurn()

				await test.playCardFromHand(BuilderDoubleItem, 'item', 1, 1)
				await test.attack('secondary')
				expect(game.state.pickRequests).toHaveLength(0)
				await test.endTurn()

				await test.playCardFromHand(BalancedItem, 'item', 0, 2)
				await test.attack('secondary')
				await test.endTurn()

				await test.endTurn()

				await test.attack('secondary')
				await test.endTurn()

				await test.changeActiveHermit(1)
				await test.attack('secondary')
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
