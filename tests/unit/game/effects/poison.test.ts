import {describe, expect, test} from '@jest/globals'
import {GoldArmor} from 'common/cards/attach/armor'
import VintageBeefCommon from 'common/cards/hermits/vintagebeef-common'
import SplashPotionOfPoison from 'common/cards/single-use/splash-potion-of-poison'
import {RowComponent} from 'common/components'
import query from 'common/components/query'
import {testGame} from '../utils'

describe('Test Poison', () => {
	test('Poison Ignores Damage Reduction', async () => {
		await testGame(
			{
				playerOneDeck: [VintageBeefCommon, GoldArmor],
				playerTwoDeck: [VintageBeefCommon, SplashPotionOfPoison],
				testGame: async (test, game) => {
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 0)
					await test.playCardFromHand(GoldArmor, 'attach', 0)
					await test.endTurn()

					await test.playCardFromHand(VintageBeefCommon, 'hermit', 0)
					await test.playCardFromHand(SplashPotionOfPoison, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(VintageBeefCommon.health - 20)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
