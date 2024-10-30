import {describe, expect, test} from '@jest/globals'
import SculkCatalyst from 'common/cards/advent-of-tcg/attach/sculk-catalyst'
import EvilXisumaBoss from 'common/cards/boss/hermits/evilxisuma_boss'
import ImpulseSVRare from 'common/cards/hermits/impulsesv-rare'
import TangoTekCommon from 'common/cards/hermits/tangotek-common'
import {
	attack,
	bossAttack,
	endTurn,
	playCardFromHand,
	testBossFight,
} from '../../utils'

describe('Test Sculk Catalyst', () => {
	test('Sculk Catalyst triggers when Evil X boss loses a life', () => {
		testBossFight(
			{
				playerDeck: [
					ImpulseSVRare,
					TangoTekCommon,
					TangoTekCommon,
					SculkCatalyst,
				],
				saga: function* (game) {
					yield* playCardFromHand(game, ImpulseSVRare, 'hermit', 0)
					yield* playCardFromHand(game, TangoTekCommon, 'hermit', 1)
					yield* playCardFromHand(game, TangoTekCommon, 'hermit', 2)
					yield* endTurn(game)

					yield* playCardFromHand(game, EvilXisumaBoss, 'hermit', 0)
					yield* bossAttack(game, '50DMG')
					yield* endTurn(game)

					yield* playCardFromHand(game, SculkCatalyst, 'attach', 0)
					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* bossAttack(game, '70DMG')
					yield* endTurn(game)

					yield* attack(game, 'secondary')
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
