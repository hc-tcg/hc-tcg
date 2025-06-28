import {describe, expect, test} from '@jest/globals'
import MasterOfPuppets from 'common/achievements/master-of-puppets'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import RendogRare from 'common/cards/hermits/rendog-rare'
import ZombieCleoRare from 'common/cards/hermits/zombiecleo-rare'
import query from 'common/components/query'
import {
	attack,
	endTurn,
	finishModalRequest,
	forfeit,
	pick,
	playCardFromHand,
	testAchivement,
} from '../utils'

describe('Test Master of Puppets Achievement', () => {
	test('Test achievement is gained after using both Ren and Cleo to mimic attack', () => {
		testAchivement(
			{
				achievement: MasterOfPuppets,
				playerOneDeck: [RendogRare, EthosLabCommon],
				playerTwoDeck: [ZombieCleoRare],
				playGame: function* (game) {
					await test.playCardFromHand(RendogRare, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					yield* endTurn(game)
					await test.playCardFromHand(ZombieCleoRare, 'hermit', 0)
					yield* endTurn(game)

					await test.attack('secondary')
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
				playerOneDeck: [ZombieCleoRare, ZombieCleoRare],
				playerTwoDeck: [EthosLabCommon],
				playGame: function* (game) {
					await test.playCardFromHand(ZombieCleoRare, 'hermit', 0)
					await test.playCardFromHand(ZombieCleoRare, 'hermit', 1)
					yield* endTurn(game)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					await test.attack('secondary')
					yield* pick(
						game,
						query.slot.rowIndex(1),
						query.slot.hermit,
						query.slot.currentPlayer,
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
					expect(MasterOfPuppets.getProgress(achievement.goals)).toBeFalsy()
				},
			},
			{noItemRequirements: true, startWithAllCards: false},
		)
	})
})
