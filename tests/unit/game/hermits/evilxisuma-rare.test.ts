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
import {TestGameFixture, testGame} from '../utils'

async function testEvilXDisablesForOneTurn(
	test: TestGameFixture,
	game: GameModel,
) {
	await test.playCardFromHand(EvilXisumaRare, 'hermit', 0)
	await test.endTurn()

	await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
	await test.endTurn()

	await test.attack('secondary')
	await test.finishModalRequest({
		pick: 'secondary',
	})

	await test.endTurn()

	expect(game.getAllBlockedActions()).toContain('SECONDARY_ATTACK')
	expect(
		game.components.exists(
			StatusEffectComponent,
			query.effect.is(SecondaryAttackDisabledEffect),
			query.effect.targetIsCardAnd(query.card.currentPlayer),
		),
	).toBeTruthy()

	await test.endTurn()
	await test.endTurn()

	// The status should now be timed out.
	expect(game.getAllBlockedActions()).not.toContain('SECONDARY_ATTACK')
	expect(
		game.components.exists(
			StatusEffectComponent,
			query.effect.is(SecondaryAttackDisabledEffect),
			query.effect.targetIsCardAnd(query.card.currentPlayer),
		),
	).toBeFalsy()

	await test.endTurn()
}

describe('Test Evil X', () => {
	test('Test Evil X disables attack for one turn', async () => {
		await testGame(
			{
				testGame: testEvilXDisablesForOneTurn,
				playerOneDeck: [EvilXisumaRare],
				playerTwoDeck: [EthosLabCommon],
			},
			{startWithAllCards: true, forceCoinFlip: true, noItemRequirements: true},
		)
	})
	test('Test Evil X secondary does not open popup if there are no opponent active hermits', async () => {
		await testGame(
			{
				playerOneDeck: [ArmorStand, EthosLabCommon],
				playerTwoDeck: [EvilXisumaRare],
				testGame: async (test: TestGameFixture, game: GameModel) => {
					await test.playCardFromHand(ArmorStand, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(EvilXisumaRare, 'hermit', 0)
					await test.attack('secondary')

					// We expect that there is no modal requests because Evil X found that the opponent has no attacks to disable.
					expect(game.state.modalRequests).toStrictEqual([])
				},
			},
			{noItemRequirements: true, startWithAllCards: true, forceCoinFlip: true},
		)
	})
	test('Test Evil X secondary with no afk hermits can disable Puppetry', async () => {
		await testGame(
			{
				playerOneDeck: [ZombieCleoRare, EthosLabCommon],
				playerTwoDeck: [EvilXisumaRare],
				testGame: async (test, game) => {
					await test.playCardFromHand(ZombieCleoRare, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(EvilXisumaRare, 'hermit', 0)
					await test.attack('secondary')

					expect(
						(game.state.modalRequests[0].modal as CopyAttack.Data)
							.availableAttacks,
					).toContain('secondary')
					await test.finishModalRequest({pick: 'secondary'})
				},
			},
			{noItemRequirements: true, forceCoinFlip: true},
		)
	})
	test('Test Evil X secondary can disable opponent Time Skip after flipping heads to skip a turn', async () => {
		await testGame(
			{
				playerOneDeck: [JoeHillsRare],
				playerTwoDeck: [JoeHillsRare, EvilXisumaRare, ChorusFruit],
				testGame: async (test, game) => {
					await test.playCardFromHand(JoeHillsRare, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(JoeHillsRare, 'hermit', 0)
					await test.playCardFromHand(EvilXisumaRare, 'hermit', 1)
					await test.playCardFromHand(ChorusFruit, 'single_use')
					await test.attack('secondary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.endTurn()

					await test.endTurn()

					await test.attack('secondary')
					await test.finishModalRequest({pick: 'secondary'})
					await test.endTurn()

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
