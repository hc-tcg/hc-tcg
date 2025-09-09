import {describe, expect, test} from '@jest/globals'
import SculkCatalyst from 'common/cards/advent-of-tcg/attach/sculk-catalyst'
import EvilXisumaBoss from 'common/cards/boss/hermits/evilxisuma_boss'
import BdoubleO100Common from 'common/cards/hermits/bdoubleo100-common'
import ImpulseSVRare from 'common/cards/hermits/impulsesv-rare'
import TangoTekCommon from 'common/cards/hermits/tangotek-common'
import {testBossFight} from '../../utils'

describe('Test Sculk Catalyst', () => {
	test('Sculk Catalyst triggers when Evil X boss loses a life', async () => {
		testBossFight(
			{
				playerDeck: [
					ImpulseSVRare,
					TangoTekCommon,
					BdoubleO100Common,
					SculkCatalyst,
				],
				testGame: async (test, game) => {
					await test.playCardFromHand(ImpulseSVRare, 'hermit', 0)
					await test.playCardFromHand(TangoTekCommon, 'hermit', 1)
					await test.playCardFromHand(BdoubleO100Common, 'hermit', 2)
					await test.endTurn()

					await test.playCardFromHand(EvilXisumaBoss, 'hermit', 0)
					await test.bossAttack('50DMG')
					await test.endTurn()

					await test.playCardFromHand(SculkCatalyst, 'attach', 0)
					await test.attack('secondary')
					await test.endTurn()

					await test.bossAttack('70DMG')
					await test.endTurn()

					await test.attack('secondary')
					expect(game.opponentPlayer.lives).toBe(2)
					expect(game.currentPlayer.activeRow?.health).toBe(
						ImpulseSVRare.health - 70,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
