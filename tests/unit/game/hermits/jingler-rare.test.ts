import {describe, expect, test} from '@jest/globals'
import {Thorns} from 'common/cards/attach/thorns'
import Totem from 'common/cards/attach/totem'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import FarmerBeefCommon from 'common/cards/hermits/farmerbeef-common'
import GoodTimesWithScarRare from 'common/cards/hermits/goodtimeswithscar-rare'
import IJevinRare from 'common/cards/hermits/ijevin-rare'
import PearlescentMoonCommon from 'common/cards/hermits/pearlescentmoon-common'
import WelsknightCommon from 'common/cards/hermits/welsknight-common'
import Bow from 'common/cards/single-use/bow'
import LavaBucket from 'common/cards/single-use/lava-bucket'
import TNT from 'common/cards/single-use/tnt'
import {
	CardComponent,
	RowComponent,
	StatusEffectComponent,
} from 'common/components'
import query from 'common/components/query'
import {RevivedByDeathloopEffect} from 'common/status-effects/death-loop'
import FireEffect from 'common/status-effects/fire'
import {
	applyEffect,
	attack,
	endTurn,
	pick,
	playCardFromHand,
	testGame,
} from '../utils'
import JinglerRare from 'common/cards/hermits/jingler-rare'

describe('Test Jingler Rare', () => {
	test('Test Jingler Forces Opponent To Discard Two Cards', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon],
				playerTwoDeck: [JinglerRare],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, JinglerRare, 'hermit', 0)
					yield* attack(game, 'secondary')

					yield* pick(game, query.slot.hand, query.slot.opponent)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
