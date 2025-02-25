import {expect, test} from '@jest/globals'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import {
	attack,
	endTurn,
	forfeit,
	pick,
	playCardFromHand,
	testAchivement,
} from '../utils'
import {describe} from 'node:test'
import TargetedLightning from 'common/achievements/targeted-lightning'
import TargetBlock from 'common/cards/single-use/target-block'
import LightningRod from 'common/cards/attach/lightning-rod'
import query from 'common/components/query'
import {RowComponent} from 'common/components'

describe('Test Targeted Lightning achievement', () => {
	test('Test Targeted Lightning achievement', () => {
		testAchivement(
			{
				achievement: TargetedLightning,
				playerOneDeck: [EthosLabCommon, TargetBlock],
				playerTwoDeck: [EthosLabCommon, EthosLabCommon, LightningRod],
				playGame: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, LightningRod, 'attach', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, TargetBlock, 'single_use')
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.not(query.slot.active),
						query.not(query.slot.empty),
					)

					for (const hermit of game.components.filter(RowComponent)) {
						if (hermit.health) hermit.health = 10
					}

					yield* attack(game, 'secondary')

					yield* forfeit(game.opponentPlayer.entity)
				},
				checkAchivement(_game, achievement, _outcome) {
					expect(TargetedLightning.getProgress(achievement.goals)).toEqual(1)
				},
			},
			{oneShotMode: true, noItemRequirements: true},
		)
	})
})
