import {describe, expect, test} from '@jest/globals'
import ArmorStand from 'common/cards/attach/armor-stand'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import JoeHillsRare from 'common/cards/hermits/joehills-rare'
import RendogRare from 'common/cards/hermits/rendog-rare'
import ZombieCleoRare from 'common/cards/hermits/zombiecleo-rare'
import Crossbow from 'common/cards/single-use/crossbow'
import {RowComponent} from 'common/components'
import query from 'common/components/query'
import {CopyAttack} from 'common/types/modal-requests'
import {
	attack,
	changeActiveHermit,
	endTurn,
	finishModalRequest,
	pick,
	playCardFromHand,
	removeEffect,
	testGame,
} from '../utils'

describe('Test Rendog Role Play', () => {
	test('Using Role Play on Puppetry', () => {
		await testGame(
			{
				playerOneDeck: [ZombieCleoRare, EthosLabCommon],
				playerTwoDeck: [RendogRare, EthosLabCommon, Crossbow],
				saga: async (test, game) => {
					await test.playCardFromHand(ZombieCleoRare, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(RendogRare, 'hermit', 0)
					await test.playCardFromHand(Crossbow, 'single_use')
					await test.attack('secondary')
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					expect(
						(game.state.modalRequests[0].modal as CopyAttack.Data)
							.availableAttacks,
					).not.toContain('secondary')
					yield* finishModalRequest(game, {pick: 'primary'})
					yield* removeEffect(game)
					expect(game.state.turn.availableActions).toContain('SECONDARY_ATTACK')
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.attack('secondary')
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					expect(
						(game.state.modalRequests[0].modal as CopyAttack.Data)
							.availableAttacks,
					).toContain('secondary')
					yield* finishModalRequest(game, {pick: 'secondary'})
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* finishModalRequest(game, {pick: 'secondary'})
					await test.endTurn()

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(ZombieCleoRare.health - EthosLabCommon.secondary.damage)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Using Puppetry on Role Play', () => {
		await testGame(
			{
				playerOneDeck: [ArmorStand, ArmorStand, EthosLabCommon],
				playerTwoDeck: [ZombieCleoRare, RendogRare, Crossbow],
				saga: async (test, game) => {
					await test.playCardFromHand(ArmorStand, 'hermit', 0)
					await test.playCardFromHand(ArmorStand, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(ZombieCleoRare, 'hermit', 0)
					await test.playCardFromHand(RendogRare, 'hermit', 1)
					await test.playCardFromHand(Crossbow, 'single_use')
					await test.attack('secondary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					expect(
						(game.state.modalRequests[0].modal as CopyAttack.Data)
							.availableAttacks,
					).not.toContain('secondary')
					yield* finishModalRequest(game, {pick: 'primary'})
					yield* removeEffect(game)
					await test.attack('secondary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* finishModalRequest(game, {pick: 'primary'})
					await test.endTurn()

					yield* changeActiveHermit(game, 1)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					yield* changeActiveHermit(game, 0)
					await test.endTurn()

					await test.attack('secondary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					expect(
						(game.state.modalRequests[0].modal as CopyAttack.Data)
							.availableAttacks,
					).toContain('secondary')
					yield* finishModalRequest(game, {pick: 'secondary'})
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					yield* finishModalRequest(game, {pick: 'secondary'})
					await test.endTurn()

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(EthosLabCommon.health - EthosLabCommon.secondary.damage)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Using Role Play on Time Skip', () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, JoeHillsRare],
				playerTwoDeck: [RendogRare, Crossbow],
				saga: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(JoeHillsRare, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(RendogRare, 'hermit', 0)
					await test.attack('secondary')
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* finishModalRequest(game, {pick: 'secondary'})
					await test.endTurn()

					yield* changeActiveHermit(game, 1)
					await test.endTurn()

					await test.playCardFromHand(Crossbow, 'single_use')
					await test.attack('secondary')
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					expect(
						(game.state.modalRequests[0].modal as CopyAttack.Data)
							.availableAttacks,
					).not.toContain('secondary')
					yield* finishModalRequest(game, {pick: 'primary'})
					yield* removeEffect(game)
					await test.attack('secondary')
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					yield* finishModalRequest(game, {pick: 'secondary'})
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Role Play is disabled when opponent has no Hermit cards', () => {
		await testGame(
			{
				playerOneDeck: [RendogRare],
				playerTwoDeck: [ArmorStand],
				saga: async (test, game) => {
					await test.playCardFromHand(RendogRare, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(ArmorStand, 'hermit', 0)
					await test.endTurn()

					expect(game.state.turn.availableActions).not.toContain(
						'SECONDARY_ATTACK',
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
