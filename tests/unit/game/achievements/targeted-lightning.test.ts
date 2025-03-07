import {describe, expect, test} from '@jest/globals'
import Channeling from 'common/achievements/targeted-lightning'
import LightningRod from 'common/cards/attach/lightning-rod'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import GoatfatherRare from 'common/cards/hermits/goatfather-rare'
import TargetBlock from 'common/cards/single-use/target-block'
import {RowComponent} from 'common/components'
import query from 'common/components/query'
import {
	attack,
	changeActiveHermit,
	endTurn,
	forfeit,
	pick,
	playCardFromHand,
	testAchivement,
} from '../utils'

describe('Test Channeling achievement', () => {
	test('"Channeling" increases properly', () => {
		testAchivement(
			{
				achievement: Channeling,
				playerOneDeck: [EthosLabCommon, EthosLabCommon, LightningRod],
				playerTwoDeck: [GoatfatherRare],
				playGame: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, LightningRod, 'attach', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, GoatfatherRare, 'hermit', 0)

					for (const hermit of game.components.filter(RowComponent)) {
						if (hermit.health) hermit.health = 10
					}

					yield* attack(game, 'secondary')

					yield* forfeit(game.opponentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(Channeling.getProgress(achievement.goals)).toEqual(1)
				},
			},
			{oneShotMode: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})
	test('"Channeling" does not increase when Lightning Rod on active row', () => {
		testAchivement(
			{
				achievement: Channeling,
				playerOneDeck: [EthosLabCommon, EthosLabCommon, LightningRod],
				playerTwoDeck: [EthosLabCommon],
				playGame: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, LightningRod, 'attach', 1)

					yield* endTurn(game)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* changeActiveHermit(game, 1)
					yield* endTurn(game)

					for (const hermit of game.components.filter(RowComponent)) {
						if (hermit.health) hermit.health = 10
					}

					yield* attack(game, 'secondary')

					yield* forfeit(game.opponentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(Channeling.getProgress(achievement.goals)).toBeFalsy()
				},
			},
			{oneShotMode: true, noItemRequirements: true},
		)
	})
})
