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
		testGame(
			{
				playerOneDeck: [ZombieCleoRare, EthosLabCommon],
				playerTwoDeck: [RendogRare, EthosLabCommon, Crossbow],
				saga: function* (game) {
					yield* playCardFromHand(game, ZombieCleoRare, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, RendogRare, 'hermit', 0)
					yield* playCardFromHand(game, Crossbow, 'single_use')
					yield* attack(game, 'secondary')
					yield* pick(
						game,
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
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					expect(
						(game.state.modalRequests[0].modal as CopyAttack.Data)
							.availableAttacks,
					).toContain('secondary')
					yield* finishModalRequest(game, {pick: 'secondary'})
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* finishModalRequest(game, {pick: 'secondary'})
					yield* endTurn(game)

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
		testGame(
			{
				playerOneDeck: [ArmorStand, ArmorStand, EthosLabCommon],
				playerTwoDeck: [ZombieCleoRare, RendogRare, Crossbow],
				saga: function* (game) {
					yield* playCardFromHand(game, ArmorStand, 'hermit', 0)
					yield* playCardFromHand(game, ArmorStand, 'hermit', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, ZombieCleoRare, 'hermit', 0)
					yield* playCardFromHand(game, RendogRare, 'hermit', 1)
					yield* playCardFromHand(game, Crossbow, 'single_use')
					yield* attack(game, 'secondary')
					yield* pick(
						game,
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
					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* finishModalRequest(game, {pick: 'primary'})
					yield* endTurn(game)

					yield* changeActiveHermit(game, 1)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* changeActiveHermit(game, 0)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					expect(
						(game.state.modalRequests[0].modal as CopyAttack.Data)
							.availableAttacks,
					).toContain('secondary')
					yield* finishModalRequest(game, {pick: 'secondary'})
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					yield* finishModalRequest(game, {pick: 'secondary'})
					yield* endTurn(game)

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
		testGame(
			{
				playerOneDeck: [EthosLabCommon, JoeHillsRare],
				playerTwoDeck: [RendogRare, Crossbow],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, JoeHillsRare, 'hermit', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, RendogRare, 'hermit', 0)
					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* finishModalRequest(game, {pick: 'secondary'})
					yield* endTurn(game)

					yield* changeActiveHermit(game, 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, Crossbow, 'single_use')
					yield* attack(game, 'secondary')
					yield* pick(
						game,
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
					yield* attack(game, 'secondary')
					yield* pick(
						game,
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
		testGame(
			{
				playerOneDeck: [RendogRare],
				playerTwoDeck: [ArmorStand],
				saga: function* (game) {
					yield* playCardFromHand(game, RendogRare, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, ArmorStand, 'hermit', 0)
					yield* endTurn(game)

					expect(game.state.turn.availableActions).not.toContain(
						'SECONDARY_ATTACK',
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
