import {describe, expect, test} from '@jest/globals'
import ArmorStand from 'common/cards/attach/armor-stand'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import EvilXisumaRare from 'common/cards/hermits/evilxisuma_rare'
import JoeHillsRare from 'common/cards/hermits/joehills-rare'
import ZombieCleoRare from 'common/cards/hermits/zombiecleo-rare'
import ChorusFruit from 'common/cards/single-use/chorus-fruit'
import {StatusEffectComponent} from 'common/components'
import query from 'common/components/query'
import {GameModel} from 'common/models/game-model'
import {SecondaryAttackDisabledEffect} from 'common/status-effects/singleturn-attack-disabled'
import {CopyAttack} from 'common/types/modal-requests'
import {
	attack,
	endTurn,
	finishModalRequest,
	pick,
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
	test('Test Evil X secondary with no afk hermits can disable Puppetry', () => {
		testGame(
			{
				playerOneDeck: [ZombieCleoRare, EthosLabCommon],
				playerTwoDeck: [EvilXisumaRare],
				saga: function* (game) {
					yield* playCardFromHand(game, ZombieCleoRare, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, EvilXisumaRare, 'hermit', 0)
					yield* attack(game, 'secondary')

					expect(
						(game.state.modalRequests[0].modal as CopyAttack.Data)
							.availableAttacks,
					).toContain('secondary')
					yield* finishModalRequest(game, {pick: 'secondary'})
				},
			},
			{noItemRequirements: true, forceCoinFlip: true},
		)
	})
	test('Test Evil X secondary can disable opponent Time Skip after flipping heads to skip a turn', () => {
		testGame(
			{
				playerOneDeck: [JoeHillsRare],
				playerTwoDeck: [JoeHillsRare, EvilXisumaRare, ChorusFruit],
				saga: function* (game) {
					yield* playCardFromHand(game, JoeHillsRare, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, JoeHillsRare, 'hermit', 0)
					yield* playCardFromHand(game, EvilXisumaRare, 'hermit', 1)
					yield* playCardFromHand(game, ChorusFruit, 'single_use')
					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* endTurn(game)

					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* finishModalRequest(game, {pick: 'secondary'})
					yield* endTurn(game)

					expect(game.getAllBlockedActions()).toContain('SECONDARY_ATTACK')
					expect(
						game.components.exists(
							StatusEffectComponent,
							query.effect.is(SecondaryAttackDisabledEffect),
							query.effect.targetIsCardAnd(query.card.currentPlayer),
						),
					).toBeTruthy()
				},
			},
			{noItemRequirements: true, forceCoinFlip: true},
		)
	})
})
