import {describe, expect, test} from '@jest/globals'
import ArmorStand from 'common/cards/alter-egos/effects/armor-stand'
import EvilXisumaRare from 'common/cards/alter-egos/hermits/evilxisuma_rare'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import {StatusEffectComponent} from 'common/components'
import query from 'common/components/query'
import {GameModel} from 'common/models/game-model'
import {SecondaryAttackDisabledEffect} from 'common/status-effects/singleturn-attack-disabled'
import {
	attack,
	endTurn,
	finishModalRequest,
	playCardFromHand,
	testGame,
} from '../utils'

function* testEvilXDisablesForOneTurn(game: GameModel) {
	yield* playCardFromHand(game, EvilXisumaRare, 'hermit', 0)
	yield* endTurn(game)

	yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
	yield* endTurn(game)

	yield* attack(game, 'secondary')
	yield* finishModalRequest(game, {
		pick: 'secondary',
	})

	yield* endTurn(game)

	expect(game.getAllBlockedActions()).toContain('SECONDARY_ATTACK')
	expect(
		game.components.exists(
			StatusEffectComponent,
			query.effect.is(SecondaryAttackDisabledEffect),
			query.effect.targetIsCardAnd(query.card.currentPlayer),
		),
	).toBeTruthy()

	yield* endTurn(game)
	yield* endTurn(game)

	// The status should now be timed out.
	expect(game.getAllBlockedActions()).not.toContain('SECONDARY_ATTACK')
	expect(
		game.components.exists(
			StatusEffectComponent,
			query.effect.is(SecondaryAttackDisabledEffect),
			query.effect.targetIsCardAnd(query.card.currentPlayer),
		),
	).toBeFalsy()

	yield* endTurn(game)
}

describe('Test Evil X', () => {
	test('Test Evil X disables attack for one turn', () => {
		testGame(
			{
				saga: testEvilXDisablesForOneTurn,
				playerOneDeck: [EvilXisumaRare],
				playerTwoDeck: [EthosLabCommon],
			},
			{startWithAllCards: true, forceCoinFlip: true, noItemRequirements: true},
		)
	})
	test('Test Evil X secondary does not open popup if there are no opponent active hermits', () => {
		testGame(
			{
				playerOneDeck: [ArmorStand, EthosLabCommon],
				playerTwoDeck: [EvilXisumaRare],
				saga: function* (game: GameModel) {
					yield* playCardFromHand(game, ArmorStand, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, EvilXisumaRare, 'hermit', 0)
					yield* attack(game, 'secondary')

					// We expect that there is no modal requests because Evil X found that the opponent has no attacks to disable.
					expect(game.state.modalRequests).toStrictEqual([])
				},
			},
			{noItemRequirements: true, startWithAllCards: true, forceCoinFlip: true},
		)
	})
})
