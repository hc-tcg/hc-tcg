import {describe, expect, test} from '@jest/globals'
import NewTeamCanada from 'common/achievements/new-team-canada'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import GeminiTayCommon from 'common/cards/hermits/geminitay-common'
import ShadEECommon from 'common/cards/hermits/shadee-common'
import TangoTekRare from 'common/cards/hermits/tangotek-rare'
import VintageBeefCommon from 'common/cards/hermits/vintagebeef-common'
import {endTurn, forfeit, playCardFromHand, testAchivement} from '../utils'

describe('Test New Team Canada achievement', () => {
	test('New Team Canada only triggers when containing all members and no others', () => {
		testAchivement(
			{
				achievement: NewTeamCanada,
				playerOneDeck: [EthosLabCommon, VintageBeefCommon, GeminiTayCommon],
				playerTwoDeck: [ShadEECommon],
				playGame: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)
					yield* forfeit(game.currentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(NewTeamCanada.getProgress(achievement.goals)).toEqual(1)
				},
			},
			{noItemRequirements: true, oneShotMode: true},
		)
	})
	test('New Team Canada does not trigger when missing member', () => {
		testAchivement(
			{
				achievement: NewTeamCanada,
				playerOneDeck: [EthosLabCommon, VintageBeefCommon],
				playerTwoDeck: [ShadEECommon],
				playGame: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)
					yield* forfeit(game.currentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(NewTeamCanada.getProgress(achievement.goals)).toBeFalsy()
				},
			},
			{noItemRequirements: true, oneShotMode: true},
		)
	})
	test('New Team Canada does not trigger when containing others', () => {
		testAchivement(
			{
				achievement: NewTeamCanada,
				playerOneDeck: [
					EthosLabCommon,
					VintageBeefCommon,
					GeminiTayCommon,
					TangoTekRare,
				],
				playerTwoDeck: [ShadEECommon],
				playGame: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)
					yield* forfeit(game.currentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(NewTeamCanada.getProgress(achievement.goals)).toBeFalsy()
				},
			},
			{noItemRequirements: true, oneShotMode: true},
		)
	})
})
