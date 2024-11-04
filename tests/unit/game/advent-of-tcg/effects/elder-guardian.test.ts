import {describe, expect, test} from '@jest/globals'
import {attack, endTurn, playCardFromHand, testGame} from '../../utils'
import ElderGuardian from 'common/cards/advent-of-tcg/attach/elder-guardian'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import {StatusEffectComponent} from 'common/components'
import query from 'common/components/query'
import MiningFatigueEffect from 'common/status-effects/mining-fatigue'

describe('Test Elder Guardian', () => {
	test('Test mining fatigue is applied', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, ElderGuardian],
				playerTwoDeck: [EthosLabCommon],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, ElderGuardian, 'attach', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* attack(game, 'primary')

					yield* endTurn(game)
					yield* endTurn(game)

					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(MiningFatigueEffect),
							query.not(query.effect.targetEntity(null)),
						),
					)

					yield* endTurn(game)
					yield* endTurn(game)

					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(MiningFatigueEffect),
							query.effect.targetEntity(null),
						),
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
