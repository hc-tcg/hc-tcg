import {describe, expect, test} from '@jest/globals'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import Bow from 'common/cards/single-use/bow'
import {CardComponent, RowComponent} from 'common/components'
import query from 'common/components/query'
import {testGame} from '../utils'

describe('Test Saving and Loading', () => {
	test('Test save and load bow when on game field', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, Bow],
				playerTwoDeck: [EthosLabCommon, EthosLabCommon],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(Bow, 'single_use')

					const bowCard = game.components.find(
						CardComponent,
						(_g, c) => c.props.id === Bow.id,
					)!

					let bowData = bowCard.save()
					game.components.delete(bowCard.entity)
					game.components.load(CardComponent, bowData)

					await test.attack('single-use')
					await test.pick(
						query.slot.rowIndex(1),
						query.slot.hermit,
						query.slot.opponent,
					)

					expect(
						game.components.find(
							RowComponent,
							query.row.index(1),
							query.row.opponentPlayer,
						)?.health,
					).toBe(EthosLabCommon.health - 40)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
	test('Test save and load bow when in hand', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, Bow],
				playerTwoDeck: [EthosLabCommon, EthosLabCommon],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					const bowCard = game.components.find(
						CardComponent,
						(_g, c) => c.props.id === Bow.id,
					)!
					let bowData = bowCard.save()
					game.components.delete(bowCard.entity)
					game.components.load(CardComponent, bowData)

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(Bow, 'single_use')

					await test.attack('single-use')
					await test.pick(
						query.slot.rowIndex(1),
						query.slot.hermit,
						query.slot.opponent,
					)

					expect(
						game.components.find(
							RowComponent,
							query.row.index(1),
							query.row.opponentPlayer,
						)?.health,
					).toBe(EthosLabCommon.health - 40)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
