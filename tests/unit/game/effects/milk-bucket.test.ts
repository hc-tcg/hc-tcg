import {describe, expect, test} from '@jest/globals'
import MilkBucket from 'common/cards/attach/milk-bucket'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import FarmerBeefCommon from 'common/cards/hermits/farmerbeef-common'
import BadOmen from 'common/cards/single-use/bad-omen'
import SplashPotionOfPoison from 'common/cards/single-use/splash-potion-of-poison'
import {StatusEffectComponent} from 'common/components'
import query from 'common/components/query'
import BadOmenEffect from 'common/status-effects/bad-omen'
import PoisonEffect from 'common/status-effects/poison'
import {testGame} from '../utils'

describe('Test Milk Bucket', () => {
	test('Single Use Functionality', async () => {
		await testGame({
			playerOneDeck: [FarmerBeefCommon, MilkBucket],
			playerTwoDeck: [EthosLabCommon, BadOmen, SplashPotionOfPoison],
			testGame: async (test, game) => {
				await test.playCardFromHand(FarmerBeefCommon, 'hermit', 0)
				await test.endTurn()

				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.playCardFromHand(SplashPotionOfPoison, 'single_use')
				await test.applyEffect()
				await test.endTurn()

				await test.endTurn()

				await test.playCardFromHand(BadOmen, 'single_use')
				await test.applyEffect()
				await test.endTurn()

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

				await test.playCardFromHand(MilkBucket, 'single_use')
				await test.pick(
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
