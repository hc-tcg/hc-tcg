import {describe, expect, test} from '@jest/globals'
import DoubleEmerald from 'common/achievements/double-emerald'
import {IronArmor} from 'common/cards/attach/armor'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import GrianRare from 'common/cards/hermits/grian-rare'
import Emerald from 'common/cards/single-use/emerald'
import {testAchivement} from '../utils'

describe('Test I Needed That achievement', () => {
	test('Test using two emeralds after an Attach effect', async () => {
		await testAchivement({
			achievement: DoubleEmerald,
			playerOneDeck: [EthosLabCommon, Emerald, Emerald, IronArmor],
			playerTwoDeck: [EthosLabCommon],
			playGame: async (test, game) => {
				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.endTurn()

				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.endTurn()

				await test.playCardFromHand(IronArmor, 'attach', 0)
				await test.playCardFromHand(Emerald, 'single_use')
				await test.applyEffect()
				await test.endTurn()

				await test.endTurn()

				await test.playCardFromHand(Emerald, 'single_use')
				await test.applyEffect()

				await test.forfeit(game.currentPlayerEntity)
			},
			checkAchivement(_game, achievement, _outcome) {
				expect(DoubleEmerald.getProgress(achievement.goals)).toBe(1)
			},
		})
	})

	test('Test stealing a sent Attach effect with Rare Grian', async () => {
		await testAchivement(
			{
				achievement: DoubleEmerald,
				playerOneDeck: [GrianRare, IronArmor, Emerald, Emerald],
				playerTwoDeck: [EthosLabCommon],
				playGame: async (test, game) => {
					await test.playCardFromHand(GrianRare, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(IronArmor, 'attach', 0)
					await test.playCardFromHand(Emerald, 'single_use')
					await test.applyEffect()
					await test.attack('primary')
					await test.finishModalRequest({result: true, cards: []}) // Attach Iron Armor to Grian
					await test.endTurn()

					await test.endTurn()

					await test.playCardFromHand(Emerald, 'single_use')
					await test.applyEffect()
					await test.attack('primary')
					await test.finishModalRequest({result: false, cards: null}) // Put Iron Armor in Grian's discard

					await test.forfeit(game.currentPlayerEntity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(DoubleEmerald.getProgress(achievement.goals)).toBe(2)
				},
			},
			{forceCoinFlip: true, noItemRequirements: true},
		)
	})
})
