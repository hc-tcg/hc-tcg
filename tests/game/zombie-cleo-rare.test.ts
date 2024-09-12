import {describe, expect, test} from '@jest/globals'
import BoomerBdubsRare from 'common/cards/alter-egos-ii/hermits/boomerbdubs-rare'
import ArchitectFalseRare from 'common/cards/alter-egos-iii/hermits/architectfalse-rare'
import BeetlejhostRare from 'common/cards/alter-egos-iii/hermits/beetlejhost-rare'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import ZombieCleoRare from 'common/cards/default/hermits/zombiecleo-rare'
import SmallishbeansCommon from 'common/cards/season-x/hermits/smallishbeans-common'
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

function* testPuppetryCanceling(game: GameModel) {
	yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)

	yield* endTurn(game)

	yield* playCardFromHand(game, ZombieCleoRare, 'hermit', 0)
	yield* playCardFromHand(game, ZombieCleoRare, 'hermit', 1)
	yield* playCardFromHand(game, BoomerBdubsRare, 'hermit', 2)

	yield* attack(game, 'secondary')

	yield* pick(
		game,
		query.slot.currentPlayer,
		query.slot.hermit,
		query.slot.rowIndex(1),
	)

	yield* finishModalRequest(game, {pick: 'secondary'})

	expect(game.state.pickRequests).toHaveLength(1)
	yield* pick(
		game,
		query.slot.currentPlayer,
		query.slot.hermit,
		query.slot.rowIndex(2),
	)

	yield* finishModalRequest(game, {cancel: true})

	yield* attack(game, 'secondary')

	expect(game.state.pickRequests).toHaveLength(1)
	yield* pick(
		game,
		query.slot.currentPlayer,
		query.slot.hermit,
		query.slot.rowIndex(1),
	)

	yield* finishModalRequest(game, {pick: 'secondary'})

	expect(game.state.pickRequests).toHaveLength(1)
	yield* pick(
		game,
		query.slot.currentPlayer,
		query.slot.hermit,
		query.slot.rowIndex(2),
	)

	yield* finishModalRequest(game, {pick: 'secondary'})
	// Flip one coin for "Watch This"
	yield* finishModalRequest(game, {result: true, cards: null})
	yield* finishModalRequest(game, {result: false, cards: null})

	expect(
		game.components.find(
			RowComponent,
			query.row.opponentPlayer,
			query.row.active,
		)?.health,
	).toBe(
		EthosLabCommon.health -
			80 /** Boomer Bdubs' base secondary damage */ -
			20 /** Extra damage from exactly 1 heads */,
	)
}

function* testPuppetingJopacity(game: GameModel) {
	yield* playCardFromHand(game, SmallishbeansCommon, 'hermit', 0)

	yield* endTurn(game)

	yield* playCardFromHand(game, ZombieCleoRare, 'hermit', 0)
	yield* playCardFromHand(game, BeetlejhostRare, 'hermit', 1)
	yield* playCardFromHand(game, SmallishbeansCommon, 'hermit', 2)

	yield* attack(game, 'secondary')
	yield* pick(
		game,
		query.slot.currentPlayer,
		query.slot.hermit,
		query.slot.rowIndex(1),
	)
	yield* finishModalRequest(game, {pick: 'secondary'})

	yield* endTurn(game)
	yield* endTurn(game)

	yield* attack(game, 'secondary')
	yield* pick(
		game,
		query.slot.currentPlayer,
		query.slot.hermit,
		query.slot.rowIndex(1),
	)
	yield* finishModalRequest(game, {pick: 'secondary'})

	expect(game.opponentPlayer.activeRow?.health).toBe(
		SmallishbeansCommon.health -
			BeetlejhostRare.secondary.damage -
			(BeetlejhostRare.secondary.damage - 10),
	)

	yield* endTurn(game)
	yield* endTurn(game)

	yield* attack(game, 'secondary')
	yield* pick(
		game,
		query.slot.currentPlayer,
		query.slot.hermit,
		query.slot.rowIndex(2),
	)
	yield* finishModalRequest(game, {pick: 'secondary'})

	expect(game.opponentPlayer.activeRow?.health).toBe(
		SmallishbeansCommon.health -
			BeetlejhostRare.secondary.damage -
			(BeetlejhostRare.secondary.damage - 10) -
			SmallishbeansCommon.secondary.damage,
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

	test('Test Puppetry After Canceling', () => {
		testGame(
			{
				saga: testPuppetryCanceling,
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [ZombieCleoRare, ZombieCleoRare, BoomerBdubsRare],
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Test using Puppetry on Jopacity', () => {
		testGame(
			{
				saga: testPuppetingJopacity,
				playerOneDeck: [SmallishbeansCommon],
				playerTwoDeck: [ZombieCleoRare, BeetlejhostRare, SmallishbeansCommon],
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
