import {expect, test} from '@jest/globals'
import CertifiedZombie from 'common/achievements/certified-zombie'
import ArmorStand from 'common/cards/attach/armor-stand'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import {endTurn, forfeit, playCardFromHand, testAchivement} from '../utils'

test('Test Use Like a Hermit achievement', () => {
	testAchivement(
		{
			achievement: CertifiedZombie,
			playerOneDeck: [ArmorStand],
			playerTwoDeck: [EthosLabCommon],
			playGame: function* (game) {
				await test.playCardFromHand(ArmorStand, 'hermit', 0)
				yield* endTurn(game)
				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				yield* endTurn(game)

				yield* endTurn(game)
				yield* endTurn(game)

				yield* forfeit(game.currentPlayer.entity)
			},
			checkAchivement(_game, achievement, _outcome) {
				expect(CertifiedZombie.getProgress(achievement.goals)).toEqual(2)
			},
		},
		{oneShotMode: true, noItemRequirements: true},
	)
})
