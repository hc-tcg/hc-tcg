import {describe, expect, test} from '@jest/globals'
import ElderGuardian from 'common/cards/advent-of-tcg/attach/elder-guardian'
import GrianchRare from 'common/cards/advent-of-tcg/hermits/grianch-rare'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import GeminiTayCommon from 'common/cards/hermits/geminitay-common'
import BalancedItem from 'common/cards/items/balanced-common'
import BalancedDoubleItem from 'common/cards/items/balanced-rare'
import Anvil from 'common/cards/single-use/anvil'
import Efficiency from 'common/cards/single-use/efficiency'
import {CardComponent, StatusEffectComponent} from 'common/components'
import query from 'common/components/query'
import {SingleTurnMiningFatigueEffect} from 'common/status-effects/mining-fatigue'
import {
	applyEffect,
	attack,
	endTurn,
	playCardFromHand,
	testGame,
} from '../../utils'

describe('Test Elder Guardian', () => {
	test('Test mining fatigue is applied', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, ElderGuardian],
				playerTwoDeck: [GeminiTayCommon],
				saga: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(ElderGuardian, 'attach', 0)
					yield* endTurn(game)

					await test.playCardFromHand(GeminiTayCommon, 'hermit', 0)
					await test.attack('primary')

					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(SingleTurnMiningFatigueEffect),
							query.not(query.effect.targetEntity(null)),
						),
					).not.toBeNull()
					yield* endTurn(game)
					yield* endTurn(game)

					expect(
						game.components
							.find(CardComponent, query.card.is(GeminiTayCommon))
							?.getAttackCost('primary'),
					).toStrictEqual(['builder', 'builder'])
					expect(
						game.components
							.find(CardComponent, query.card.is(GeminiTayCommon))
							?.getAttackCost('secondary'),
					).toStrictEqual(['builder', 'builder', 'builder', 'builder'])

					yield* endTurn(game)
					yield* endTurn(game)

					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(SingleTurnMiningFatigueEffect),
							query.effect.targetEntity(null),
						),
					).not.toBeNull()

					expect(
						game.components
							.find(CardComponent, query.card.is(GeminiTayCommon))
							?.getAttackCost('primary'),
					).toStrictEqual(['builder'])
					expect(
						game.components
							.find(CardComponent, query.card.is(GeminiTayCommon))
							?.getAttackCost('secondary'),
					).toStrictEqual(['builder', 'builder', 'builder'])
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Mining Fatigue functionality', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, ElderGuardian],
				playerTwoDeck: [
					EthosLabCommon,
					BalancedItem,
					BalancedDoubleItem,
					BalancedItem,
				],
				saga: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(ElderGuardian, 'attach', 0)
					yield* endTurn(game)

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(BalancedItem, 'item', 0, 0)
					await test.attack('primary')
					yield* endTurn(game)

					yield* endTurn(game)

					expect(game.state.turn.availableActions).not.toContain(
						'PRIMARY_ATTACK',
					)
					await test.playCardFromHand(BalancedDoubleItem, 'item', 0, 1)
					expect(game.state.turn.availableActions).toContain('PRIMARY_ATTACK')
					await test.attack('primary')
					yield* endTurn(game)

					yield* endTurn(game)

					expect(game.state.turn.availableActions).not.toContain(
						'SECONDARY_ATTACK',
					)
					await test.playCardFromHand(BalancedItem, 'item', 0, 2)
					expect(game.state.turn.availableActions).toContain('SECONDARY_ATTACK')
					yield* endTurn(game)
				},
			},
			{startWithAllCards: true, noItemRequirements: false},
		)
	})

	test('Efficiency works against Mining Fatigue', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, ElderGuardian],
				playerTwoDeck: [EthosLabCommon, Efficiency, Efficiency],
				saga: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(ElderGuardian, 'attach', 0)
					yield* endTurn(game)

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(Efficiency, 'single_use')
					yield* applyEffect(game)
					await test.attack('primary')
					yield* endTurn(game)

					yield* endTurn(game)

					expect(game.state.turn.availableActions).not.toContain(
						'PRIMARY_ATTACK',
					)
					expect(game.state.turn.availableActions).not.toContain(
						'SECONDARY_ATTACK',
					)
					await test.playCardFromHand(Efficiency, 'single_use')
					yield* applyEffect(game)
					expect(game.state.turn.availableActions).toContain('PRIMARY_ATTACK')
					expect(game.state.turn.availableActions).toContain('SECONDARY_ATTACK')
				},
			},
			{startWithAllCards: true, noItemRequirements: false},
		)
	})

	test('Mining Fatigue is not stacked by multiple attacks', () => {
		testGame(
			{
				playerOneDeck: [
					EthosLabCommon,
					EthosLabCommon,
					ElderGuardian,
					ElderGuardian,
				],
				playerTwoDeck: [GrianchRare, Anvil],
				saga: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(ElderGuardian, 'attach', 0)
					await test.playCardFromHand(ElderGuardian, 'attach', 1)
					yield* endTurn(game)

					await test.playCardFromHand(GrianchRare, 'hermit', 0)
					await test.playCardFromHand(Anvil, 'single_use')
					await test.attack('secondary')
					expect(
						game.components.filter(
							StatusEffectComponent,
							query.effect.is(SingleTurnMiningFatigueEffect),
							query.effect.targetIsCardAnd(query.card.currentPlayer),
						).length,
					).toBe(1)
					await test.attack('secondary')
					expect(
						game.components.filter(
							StatusEffectComponent,
							query.effect.is(SingleTurnMiningFatigueEffect),
							query.effect.targetIsCardAnd(query.card.currentPlayer),
						).length,
					).toBe(1)
					yield* endTurn(game)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})
})
