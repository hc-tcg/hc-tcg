import {describe, expect, test} from '@jest/globals'
import {NetheriteArmor} from 'common/cards/attach/armor'
import {
	applyEffect,
	attack,
	changeActiveHermit,
	endTurn,
	finishModalRequest,
	pick,
	playCardFromHand,
	testGame,
} from '../utils'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import Egg from 'common/cards/single-use/egg'
import TargetBlock from 'common/cards/single-use/target-block'
import { CardComponent } from 'common/components'

describe('Test Netherite Armor', () => {
	test('Netherite Armor prevents damage', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, NetheriteArmor],
				playerTwoDeck: [EthosLabCommon],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, NetheriteArmor, 'attach', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* attack(game, 'primary')
					expect(game.components.query(CardComponent, ))
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
	test('Netherite Armor prevents knockback', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, NetheriteArmor],
				playerTwoDeck: [EthosLabCommon, Egg],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, NetheriteArmor, 'attach', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})
	test('Netherite Armor prevents damage from effects', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, NetheriteArmor],
				playerTwoDeck: [EthosLabCommon, TargetBlock],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, NetheriteArmor, 'attach', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
