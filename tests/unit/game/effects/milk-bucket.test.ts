import {describe, expect, test} from '@jest/globals'
import MilkBucket from 'common/cards/attach/milk-bucket'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import FarmerBeefCommon from 'common/cards/hermits/farmerbeef-common'
import BadOmen from 'common/cards/single-use/bad-omen'
import SplashPotionOfPoison from 'common/cards/single-use/splash-potion-of-poison'
import {StatusEffectComponent} from 'common/components'
import query from 'common/components/query'
import BadOmenEffect from 'common/status-effects/badomen'
import PoisonEffect from 'common/status-effects/poison'
import {applyEffect, endTurn, pick, playCardFromHand, testGame} from '../utils'

describe('Test Milk Bucket', () => {
	test('Single Use Functionality', () => {
		testGame({
			playerOneDeck: [FarmerBeefCommon, MilkBucket],
			playerTwoDeck: [EthosLabCommon, BadOmen, SplashPotionOfPoison],
			saga: function* (game) {
				yield* playCardFromHand(game, FarmerBeefCommon, 'hermit', 0)
				yield* endTurn(game)

				yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
				yield* playCardFromHand(game, SplashPotionOfPoison, 'single_use')
				yield* applyEffect(game)
				yield* endTurn(game)

				yield* endTurn(game)

				yield* playCardFromHand(game, BadOmen, 'single_use')
				yield* applyEffect(game)
				yield* endTurn(game)

				expect(
					game.components.find(
						StatusEffectComponent,
						query.effect.is(PoisonEffect),
						query.effect.targetIsCardAnd(query.card.currentPlayer),
					),
				).not.toBe(null)
				expect(
					game.components.find(
						StatusEffectComponent,
						query.effect.is(BadOmenEffect),
						query.effect.targetIsCardAnd(query.card.currentPlayer),
					),
				).not.toBe(null)

				yield* playCardFromHand(game, MilkBucket, 'single_use')
				yield* pick(
					game,
					query.slot.currentPlayer,
					query.slot.hermit,
					query.slot.rowIndex(0),
				)

				expect(
					game.components.find(
						StatusEffectComponent,
						query.effect.is(PoisonEffect, BadOmenEffect),
						query.effect.targetIsCardAnd(query.card.currentPlayer),
					),
				).toBe(null)
			},
		})
	})
})
