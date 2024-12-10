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
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, ElderGuardian, 'attach', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, GeminiTayCommon, 'hermit', 0)
					yield* attack(game, 'primary')

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
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, ElderGuardian, 'attach', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, BalancedItem, 'item', 0, 0)
					yield* attack(game, 'primary')
					yield* endTurn(game)

					yield* endTurn(game)

					expect(game.state.turn.availableActions).not.toContain(
						'PRIMARY_ATTACK',
					)
					yield* playCardFromHand(game, BalancedDoubleItem, 'item', 0, 1)
					expect(game.state.turn.availableActions).toContain('PRIMARY_ATTACK')
					yield* attack(game, 'primary')
					yield* endTurn(game)

					yield* endTurn(game)

					expect(game.state.turn.availableActions).not.toContain(
						'SECONDARY_ATTACK',
					)
					yield* playCardFromHand(game, BalancedItem, 'item', 0, 2)
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
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, ElderGuardian, 'attach', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, Efficiency, 'single_use')
					yield* applyEffect(game)
					yield* attack(game, 'primary')
					yield* endTurn(game)

					yield* endTurn(game)

					expect(game.state.turn.availableActions).not.toContain(
						'PRIMARY_ATTACK',
					)
					expect(game.state.turn.availableActions).not.toContain(
						'SECONDARY_ATTACK',
					)
					yield* playCardFromHand(game, Efficiency, 'single_use')
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
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, ElderGuardian, 'attach', 0)
					yield* playCardFromHand(game, ElderGuardian, 'attach', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, GrianchRare, 'hermit', 0)
					yield* playCardFromHand(game, Anvil, 'single_use')
					yield* attack(game, 'secondary')
					expect(
						game.components.filter(
							StatusEffectComponent,
							query.effect.is(SingleTurnMiningFatigueEffect),
							query.effect.targetIsCardAnd(query.card.currentPlayer),
						).length,
					).toBe(1)
					yield* attack(game, 'secondary')
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
