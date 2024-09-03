import {describe, expect, test} from '@jest/globals'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import IJevinRare from 'common/cards/default/hermits/ijevin-rare'
import Iskall85Common from 'common/cards/default/hermits/iskall85-common'
import {printBoardState} from 'server/utils'
import {applyEffect, attack, endTurn, finishModalRequest, playCardFromHand, testGame} from './utils'
import NetheriteBoots from 'common/cards/alter-egos-iii/effects/netherite-boots'
import assert from 'assert'
import LavaBucket from 'common/cards/default/single-use/lava-bucket'
import {StatusEffectComponent} from 'common/components'
import query from 'common/components/query'
import FireEffect from 'common/status-effects/fire'

describe('Test Netherite Boots', () => {
	test('Test Netherite Boots Prevents 20 Damage and Burn', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, NetheriteBoots],
				playerTwoDeck: [EthosLabCommon, LavaBucket],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, NetheriteBoots, 'attach', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, LavaBucket, 'single_use')
          yield* applyEffect(game) 

					yield* attack(game, 'secondary')

					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(FireEffect),
						),
					).not.toBeNull()

					yield* endTurn(game)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
