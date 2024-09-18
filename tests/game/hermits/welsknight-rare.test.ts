import {describe, expect, test} from '@jest/globals'
import Shield from 'common/cards/default/effects/shield'
import TinFoilChefCommon from 'common/cards/default/hermits/tinfoilchef-common'
import WelsknightRare from 'common/cards/default/hermits/welsknight-rare'
import SplashPotionOfHealing from 'common/cards/default/single-use/splash-potion-of-healing'
import {RowComponent} from 'common/components'
import query from 'common/components/query'
import {attack, endTurn, playCardFromHand, testGame} from '../utils'

describe('Test rare welsknight', () => {
	test('Vengance functionality', () => {
		testGame(
			{
				playerOneDeck: [TinFoilChefCommon, SplashPotionOfHealing, Shield],
				playerTwoDeck: [WelsknightRare],
				saga: function* (game) {
					yield* playCardFromHand(game, TinFoilChefCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, WelsknightRare, 'hermit', 0)
					yield* attack(game, 'secondary')
					yield* endTurn(game)

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(TinFoilChefCommon.health - WelsknightRare.secondary.damage)

					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* endTurn(game)

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(
						TinFoilChefCommon.health -
							WelsknightRare.secondary.damage -
							(WelsknightRare.secondary.damage +
								20) /*extra damage from tfc being in yellow*/,
					)

					//make it possible to survive 140 damage while being in red
					yield* playCardFromHand(game, Shield, 'attach', 0)
					yield* playCardFromHand(game, SplashPotionOfHealing, 'single_use')
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* endTurn(game)

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(
						TinFoilChefCommon.health -
							WelsknightRare.secondary.damage -
							(WelsknightRare.secondary.damage +
								20) /*extra damage from tfc being in yellow*/ +
							20 /*splash potion of healing*/ -
							(WelsknightRare.secondary.damage +
								40 /* extra damage from tfc being in red*/ -
								60) /*shield*/,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
