import {describe, expect, test} from '@jest/globals'
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
} from './utils'

function* testEvilXDisablesForOneTurn(game: GameModel) {
	yield* playCardFromHand(game, EvilXisumaRare, 0)
	yield* endTurn(game)

	yield* playCardFromHand(game, EthosLabCommon, 0)
	yield* endTurn(game)

	yield* attack(game, 'secondary')
	yield* finishModalRequest(game, {
		pick: 'secondary',
	})

	yield* endTurn(game)

	expect(
		game.components.exists(
			StatusEffectComponent,
			query.effect.is(SecondaryAttackDisabledEffect),
			query.effect.targetIsCardAnd(query.card.currentPlayer),
		),
	).toBeTruthy()

	expect(game.getAllBlockedActions()).toContain('SECONDARY_ATTACK')

	yield* endTurn(game)

	// The status should now be timed out.
	expect(game.getAllBlockedActions()).not.toContain('SECONDARY_ATTACK')

	yield* endTurn(game)

	expect(
		game.components.exists(
			StatusEffectComponent,
			query.effect.is(SecondaryAttackDisabledEffect),
			query.effect.targetIsCardAnd(query.card.currentPlayer),
		),
	).toBeFalsy()
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
})
