import {describe, expect, test} from '@jest/globals'
import GoFish from 'common/achievements/go-fish'
import {IronArmor} from 'common/cards/attach/armor'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import GeminiTayRare from 'common/cards/hermits/geminitay-rare'
import FishingRod from 'common/cards/single-use/fishing-rod'
import Mending from 'common/cards/single-use/mending'
import query from 'common/components/query'
import {
	applyEffect,
	attack,
	endTurn,
	finishModalRequest,
	forfeit,
	pick,
	playCardFromHand,
	testAchivement,
} from '../utils'
import MasterOfPuppets from 'common/achievements/master-of-puppets'
import ZombieCleoRare from 'common/cards/hermits/zombiecleo-rare'
import RendogRare from 'common/cards/hermits/rendog-rare'

describe('Test Master of Puppets Achievement', () => {
	test('Test achievement is gained after using both Ren and Cleo to mimic attack', () => {
		testAchivement(
			{
				achievement: MasterOfPuppets,
				playerOneDeck: [RendogRare, EthosLabCommon],
				playerTwoDeck: [ZombieCleoRare],
				playGame: function* (game) {
					yield* playCardFromHand(game, RendogRare, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* endTurn(game)
					yield* playCardFromHand(game, ZombieCleoRare, 'hermit', 0)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.rowIndex(0),
						query.slot.hermit,
						query.slot.opponent,
					)
					yield* finishModalRequest(game, {pick: 'secondary'})
					yield* pick(
						game,
						query.slot.rowIndex(1),
						query.slot.hermit,
						query.slot.currentPlayer,
					)
					yield* finishModalRequest(game, {pick: 'primary'})

					yield* forfeit(game.currentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(MasterOfPuppets.getProgress(achievement.goals)).toBe(1)
				},
			},
			{noItemRequirements: true, startWithAllCards: false},
		)
	})
	test('Test achievement is not gained after using only Cleo', () => {
		testAchivement(
			{
				achievement: MasterOfPuppets,
				playerOneDeck: [ZombieCleoRare, EthosLabCommon],
				playerTwoDeck: [EthosLabCommon],
				playGame: function* (game) {
					yield* playCardFromHand(game, ZombieCleoRare, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* endTurn(game)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.rowIndex(1),
						query.slot.hermit,
						query.slot.currentPlayer,
					)
					yield* finishModalRequest(game, {pick: 'secondary'})

					yield* forfeit(game.currentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(MasterOfPuppets.getProgress(achievement.goals)).toBeFalsy()
				},
			},
			{noItemRequirements: true, startWithAllCards: false},
		)
	})
})
