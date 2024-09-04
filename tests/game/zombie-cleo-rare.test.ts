import {describe, expect, test} from '@jest/globals'
import ArchitectFalseRare from 'common/cards/alter-egos-iii/hermits/architectfalse-rare'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import ZombieCleoRare from 'common/cards/default/hermits/zombiecleo-rare'
import {RowComponent, StatusEffectComponent} from 'common/components'
import query from 'common/components/query'
import {GameModel} from 'common/models/game-model'
import {MultiturnSecondaryAttackDisabledEffect} from 'common/status-effects/multiturn-attack-disabled'
import {
	attack,
	endTurn,
	finishModalRequest,
	pick,
	playCardFromHand,
	testGame,
} from './utils'

function* testPrimaryDoesNotCrash(game: GameModel) {
	yield* playCardFromHand(game, ZombieCleoRare, 'hermit', 0)

	yield* endTurn(game)

	yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)

	yield* endTurn(game)

	yield* attack(game, 'primary')

	// Verify that the attack worked.
	expect(
		game.components.find(
			RowComponent,
			query.row.active,
			query.row.opponentPlayer,
		)?.health,
	).not.toEqual(EthosLabCommon.health)
}

function* testAmnesiaDisablesPuppetry(game: GameModel) {
	yield* playCardFromHand(game, ArchitectFalseRare, 'hermit', 0)

	yield* endTurn(game)

	yield* playCardFromHand(game, ZombieCleoRare, 'hermit', 0)
	yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)

	yield* attack(game, 'secondary')

	yield* pick(
		game,
		query.slot.currentPlayer,
		query.slot.hermit,
		query.slot.rowIndex(1),
	)

	yield* finishModalRequest(game, {pick: 'primary'})

	yield* endTurn(game)

	yield* attack(game, 'secondary')

	expect(
		game.components.find(
			StatusEffectComponent,
			query.effect.is(MultiturnSecondaryAttackDisabledEffect),
			query.effect.targetIsCardAnd(
				query.card.opponentPlayer,
				query.card.active,
			),
		),
	)
}

describe('Test Zombie Cleo', () => {
	test('Test Zombie Cleo Primary Does Not Crash Server', () => {
		testGame(
			{
				saga: testPrimaryDoesNotCrash,
				playerOneDeck: [ZombieCleoRare],
				playerTwoDeck: [EthosLabCommon],
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Test Puppetry is Disabled by Amnesia', () => {
		testGame(
			{
				saga: testAmnesiaDisablesPuppetry,
				playerOneDeck: [ArchitectFalseRare],
				playerTwoDeck: [ZombieCleoRare, EthosLabCommon],
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
