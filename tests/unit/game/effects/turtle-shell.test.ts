import {describe, expect, test} from '@jest/globals'
import ArmorStand from 'common/cards/attach/armor-stand'
import TurtleShell from 'common/cards/attach/turtle-shell'
import Cubfan135Rare from 'common/cards/hermits/cubfan135-rare'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import FarmerBeefCommon from 'common/cards/hermits/farmerbeef-common'
import GeminiTayRare from 'common/cards/hermits/geminitay-rare'
import GrianRare from 'common/cards/hermits/grian-rare'
import IJevinRare from 'common/cards/hermits/ijevin-rare'
import SkizzlemanRare from 'common/cards/hermits/skizzleman-rare'
import TangoTekRare from 'common/cards/hermits/tangotek-rare'
import ZombieCleoCommon from 'common/cards/hermits/zombiecleo-common'
import ChorusFruit from 'common/cards/single-use/chorus-fruit'
import Egg from 'common/cards/single-use/egg'
import Emerald from 'common/cards/single-use/emerald'
import Knockback from 'common/cards/single-use/knockback'
import Ladder from 'common/cards/single-use/ladder'
import LavaBucket from 'common/cards/single-use/lava-bucket'
import Mending from 'common/cards/single-use/mending'
import {CardComponent, StatusEffectComponent} from 'common/components'
import query from 'common/components/query'
import LooseShellEffect from 'common/status-effects/loose-shell'
import {SelectCards} from 'common/types/modal-requests'
import {
	applyEffect,
	attack,
	changeActiveHermit,
	endTurn,
	finishModalRequest,
	pick,
	playCardFromHand,
	testGame,
} from '../utils'

describe('Test Turtle Shell', () => {
	test('Turtle Shell applies to next turn', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, FarmerBeefCommon, TurtleShell],
				playerTwoDeck: [ZombieCleoCommon],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, FarmerBeefCommon, 'hermit', 1)
					yield* playCardFromHand(game, TurtleShell, 'attach', 1)

					yield* changeActiveHermit(game, 1)

					yield* endTurn(game)

					yield* playCardFromHand(game, ZombieCleoCommon, 'hermit', 0)
					yield* attack(game, 'secondary')

					yield* endTurn(game)

					expect(game.currentPlayer.activeRow?.health).toBe(
						FarmerBeefCommon.health,
					)
					expect(
						game.components.find(
							CardComponent,
							query.card.is(TurtleShell),
							query.card.currentPlayer,
							query.card.slot(query.slot.discardPile),
						),
					).not.toBe(null)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Turtle Shell protects against Gas Light and Egg, but not status-effect damage', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, FarmerBeefCommon, TurtleShell],
				playerTwoDeck: [SkizzlemanRare, LavaBucket, Egg],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, FarmerBeefCommon, 'hermit', 1)

					yield* endTurn(game)

					yield* playCardFromHand(game, SkizzlemanRare, 'hermit', 0)

					yield* playCardFromHand(game, LavaBucket, 'single_use')
					yield* applyEffect(game)

					yield* endTurn(game)

					yield* changeActiveHermit(game, 1)

					yield* endTurn(game)
					yield* endTurn(game)

					yield* playCardFromHand(game, TurtleShell, 'attach', 0)

					yield* endTurn(game)

					yield* playCardFromHand(game, Egg, 'single_use')
					yield* attack(game, 'secondary')

					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)

					yield* endTurn(game)

					expect(game.currentPlayer.activeRow?.index).toBe(0)
					expect(game.currentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health - 60 /* 3x Burn damage*/,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Turtle Shell is not discarded when row is activated by Knockback', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, FarmerBeefCommon, TurtleShell],
				playerTwoDeck: [ZombieCleoCommon, Knockback],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, FarmerBeefCommon, 'hermit', 1)
					yield* playCardFromHand(game, TurtleShell, 'attach', 1)

					yield* endTurn(game)

					yield* playCardFromHand(game, ZombieCleoCommon, 'hermit', 0)
					yield* playCardFromHand(game, Knockback, 'single_use')
					yield* attack(game, 'secondary')

					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)

					yield* endTurn(game)

					expect(
						game.components.find(
							CardComponent,
							query.card.is(TurtleShell),
							query.card.currentPlayer,
							query.card.attached,
						),
					).not.toBe(null)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test("Turtle Shell works with Ladder only on hermit's first turn active", () => {
		testGame(
			{
				playerOneDeck: [
					EthosLabCommon,
					EthosLabCommon,
					TurtleShell,
					Ladder,
					TurtleShell,
					Ladder,
				],
				playerTwoDeck: [ZombieCleoCommon],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, TurtleShell, 'attach', 1)

					yield* playCardFromHand(game, Ladder, 'single_use')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)

					yield* endTurn(game)

					yield* playCardFromHand(game, ZombieCleoCommon, 'hermit', 0)
					yield* attack(game, 'secondary')

					yield* endTurn(game)

					expect(game.currentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health,
					)
					expect(
						game.components.find(
							CardComponent,
							query.card.is(TurtleShell),
							query.card.currentPlayer,
							query.card.slot(query.slot.discardPile),
						),
					).not.toBe(null)

					yield* playCardFromHand(game, TurtleShell, 'attach', 0)

					yield* playCardFromHand(game, Ladder, 'single_use')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)

					yield* endTurn(game)

					yield* attack(game, 'secondary')

					yield* endTurn(game)

					expect(game.currentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health - ZombieCleoCommon.secondary.damage,
					)
					expect(
						game.components.find(
							CardComponent,
							query.card.is(TurtleShell),
							query.card.currentPlayer,
							query.card.attached,
						),
					).not.toBe(null)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Ladder deactivates Turtle Shell after active moves', () => {
		testGame(
			{
				playerOneDeck: [
					ArmorStand,
					EthosLabCommon,
					EthosLabCommon,
					TurtleShell,
					Ladder,
				],
				playerTwoDeck: [ZombieCleoCommon],
				saga: function* (game) {
					yield* playCardFromHand(game, ArmorStand, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 2)
					yield* playCardFromHand(game, TurtleShell, 'attach', 1)

					yield* endTurn(game)

					yield* playCardFromHand(game, ZombieCleoCommon, 'hermit', 0)
					yield* attack(game, 'secondary')

					yield* endTurn(game)

					yield* changeActiveHermit(game, 1)
					yield* playCardFromHand(game, Ladder, 'single_use')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(2),
					)

					yield* endTurn(game)

					yield* attack(game, 'secondary')

					yield* endTurn(game)

					expect(game.currentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health - ZombieCleoCommon.secondary.damage,
					)
					expect(
						game.components.find(
							CardComponent,
							query.card.is(TurtleShell),
							query.card.currentPlayer,
							query.card.attached,
						),
					).not.toBe(null)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Mending deactivates moved Turtle Shell', () => {
		testGame(
			{
				playerOneDeck: [
					ArmorStand,
					EthosLabCommon,
					FarmerBeefCommon,
					TurtleShell,
					Mending,
				],
				playerTwoDeck: [ZombieCleoCommon],
				saga: function* (game) {
					yield* playCardFromHand(game, ArmorStand, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, FarmerBeefCommon, 'hermit', 2)
					yield* playCardFromHand(game, TurtleShell, 'attach', 1)

					yield* endTurn(game)

					yield* playCardFromHand(game, ZombieCleoCommon, 'hermit', 0)
					yield* attack(game, 'secondary')

					yield* endTurn(game)

					yield* changeActiveHermit(game, 1)
					yield* playCardFromHand(game, Mending, 'single_use')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.attach,
						query.slot.rowIndex(2),
					)

					yield* endTurn(game)

					yield* attack(game, 'secondary')

					yield* endTurn(game)

					expect(game.currentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health - ZombieCleoCommon.secondary.damage,
					)
					expect(
						game.components.find(
							CardComponent,
							query.card.is(TurtleShell),
							query.card.currentPlayer,
							query.card.attached,
						),
					).not.toBe(null)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Turtle Shell is still discarded when row is deactivated by Knockback', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, FarmerBeefCommon, TurtleShell],
				playerTwoDeck: [ZombieCleoCommon, Knockback],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, FarmerBeefCommon, 'hermit', 1)
					yield* playCardFromHand(game, TurtleShell, 'attach', 1)
					yield* changeActiveHermit(game, 1)

					yield* endTurn(game)

					yield* playCardFromHand(game, ZombieCleoCommon, 'hermit', 0)
					yield* playCardFromHand(game, Knockback, 'single_use')
					yield* attack(game, 'secondary')

					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)

					yield* endTurn(game)

					expect(
						game.components.find(
							CardComponent,
							query.card.is(TurtleShell),
							query.card.currentPlayer,
							query.card.slot(query.slot.discardPile),
						),
					).not.toBe(null)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Correct Turtle Shell is discarded after defending against Peace Out + Egg', () => {
		testGame(
			{
				playerOneDeck: [
					ArmorStand,
					EthosLabCommon,
					FarmerBeefCommon,
					TurtleShell,
					TurtleShell,
				],
				playerTwoDeck: [IJevinRare, Egg],
				saga: function* (game) {
					yield* playCardFromHand(game, ArmorStand, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, FarmerBeefCommon, 'hermit', 2)
					yield* playCardFromHand(game, TurtleShell, 'attach', 1)
					yield* playCardFromHand(game, TurtleShell, 'attach', 2)
					yield* changeActiveHermit(game, 1)

					yield* endTurn(game)

					yield* playCardFromHand(game, IJevinRare, 'hermit', 0)
					yield* playCardFromHand(game, Egg, 'single_use')
					yield* attack(game, 'secondary')

					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(2),
					)
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)

					yield* endTurn(game)

					expect(
						game.components.find(
							CardComponent,
							query.card.is(TurtleShell),
							query.card.currentPlayer,
							query.card.slot(query.slot.discardPile),
						),
					).not.toBe(null)
					expect(
						game.components.find(
							CardComponent,
							query.card.is(TurtleShell),
							query.card.currentPlayer,
							query.card.slot(query.slot.rowIndex(2)),
						),
					).not.toBe(null)
					expect(game.currentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health,
					)

					yield* endTurn(game)
					yield* endTurn(game)
					expect(
						game.components.find(
							CardComponent,
							query.card.is(TurtleShell),
							query.card.currentPlayer,
							query.card.slot(query.slot.rowIndex(2)),
						),
					).not.toBe(null)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test("Turtle Shell works after previous active was KO'd by Extra Flee", () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, FarmerBeefCommon, TurtleShell],
				playerTwoDeck: [TangoTekRare],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, TangoTekRare, 'hermit', 0)
					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* playCardFromHand(game, FarmerBeefCommon, 'hermit', 1)
					yield* playCardFromHand(game, TurtleShell, 'attach', 1)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* endTurn(game)

					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* endTurn(game)

					expect(game.currentPlayer.activeRow?.health).toBe(
						FarmerBeefCommon.health,
					)
					expect(game.currentPlayer.activeRow?.getAttach()).toBe(null)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test("Turtle Shells borrowed by Grian only work on Grian's first turn", () => {
		testGame(
			{
				playerOneDeck: [
					EthosLabCommon,
					EthosLabCommon,
					TurtleShell,
					TurtleShell,
					ChorusFruit,
				],
				playerTwoDeck: [GrianRare],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, TurtleShell, 'attach', 1)
					yield* changeActiveHermit(game, 1)

					yield* endTurn(game)

					yield* playCardFromHand(game, GrianRare, 'hermit', 0)
					yield* attack(game, 'primary')
					expect(
						(game.state.modalRequests[0].modal as SelectCards.Data)
							.primaryButton,
					).toBeTruthy()
					// If `primaryButton` is null, Grian may not attach borrowed Turtle Shells
					yield* finishModalRequest(game, {result: true, cards: null})

					yield* endTurn(game)

					yield* playCardFromHand(game, TurtleShell, 'attach', 0)
					yield* playCardFromHand(game, ChorusFruit, 'single_use')
					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)

					yield* endTurn(game)

					expect(
						game.components.find(
							CardComponent,
							query.card.is(TurtleShell),
							query.card.currentPlayer,
							query.card.slot(query.slot.discardPile),
						),
					).not.toBe(null)
					expect(game.currentPlayer.activeRow?.health).toBe(GrianRare.health)

					yield* attack(game, 'primary')
					yield* finishModalRequest(game, {result: true, cards: null})

					yield* endTurn(game)

					yield* attack(game, 'secondary')

					yield* endTurn(game)

					expect(game.currentPlayer.activeRow?.health).toBe(
						GrianRare.health - EthosLabCommon.secondary.damage,
					)
					expect(
						game.components.find(
							CardComponent,
							query.card.is(TurtleShell),
							query.card.currentPlayer,
							query.card.attached,
						),
					).not.toBe(null)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test("Turtle Shells taken by Emerald only work on destination hermit's first turn", () => {
		testGame(
			{
				playerOneDeck: [
					EthosLabCommon,
					EthosLabCommon,
					TurtleShell,
					TurtleShell,
					ChorusFruit,
				],
				playerTwoDeck: [ZombieCleoCommon, Emerald, Emerald],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, TurtleShell, 'attach', 1)
					yield* changeActiveHermit(game, 1)

					yield* endTurn(game)

					yield* playCardFromHand(game, ZombieCleoCommon, 'hermit', 0)
					expect(game.getPickableSlots(Emerald.attachCondition).at(0)).not.toBe(
						undefined,
					) // Check if Emerald can move Turtle Shells
					yield* playCardFromHand(game, Emerald, 'single_use')
					yield* applyEffect(game)

					yield* endTurn(game)

					yield* playCardFromHand(game, TurtleShell, 'attach', 0)
					yield* playCardFromHand(game, ChorusFruit, 'single_use')
					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)

					yield* endTurn(game)

					expect(
						game.components.find(
							CardComponent,
							query.card.is(TurtleShell),
							query.card.currentPlayer,
							query.card.slot(query.slot.discardPile),
						),
					).not.toBe(null)
					expect(game.currentPlayer.activeRow?.health).toBe(
						ZombieCleoCommon.health,
					)

					yield* playCardFromHand(game, Emerald, 'single_use')
					yield* applyEffect(game)

					yield* endTurn(game)

					yield* attack(game, 'secondary')

					yield* endTurn(game)

					expect(game.currentPlayer.activeRow?.health).toBe(
						ZombieCleoCommon.health - EthosLabCommon.secondary.damage,
					)
					expect(
						game.components.find(
							CardComponent,
							query.card.is(TurtleShell),
							query.card.currentPlayer,
							query.card.attached,
						),
					).not.toBe(null)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test("Turtle Shells given by Emerald only work on destination hermit's first turn", () => {
		testGame(
			{
				playerOneDeck: [
					ArmorStand,
					ArmorStand,
					Cubfan135Rare,
					Cubfan135Rare,
					TurtleShell,
					TurtleShell,
					Emerald,
					Emerald,
				],
				playerTwoDeck: [EthosLabCommon],
				saga: function* (game) {
					yield* playCardFromHand(game, ArmorStand, 'hermit', 0)
					yield* playCardFromHand(game, Cubfan135Rare, 'hermit', 1)
					yield* playCardFromHand(game, TurtleShell, 'attach', 1)
					yield* playCardFromHand(game, ArmorStand, 'hermit', 2)
					yield* playCardFromHand(game, Cubfan135Rare, 'hermit', 3)
					yield* playCardFromHand(game, TurtleShell, 'attach', 3)

					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* attack(game, 'secondary')

					yield* endTurn(game)

					yield* changeActiveHermit(game, 1)
					expect(game.getPickableSlots(Emerald.attachCondition).at(0)).not.toBe(
						undefined,
					) // Check if Emerald can move Turtle Shells
					yield* playCardFromHand(game, Emerald, 'single_use')
					yield* applyEffect(game)

					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(2),
					)

					yield* endTurn(game)

					expect(
						game.components.find(
							CardComponent,
							query.card.is(TurtleShell),
							query.card.currentPlayer,
							query.card.slot(query.slot.discardPile),
						),
					).not.toBe(null)
					expect(game.currentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health,
					)

					yield* attack(game, 'secondary')

					yield* endTurn(game)

					yield* changeActiveHermit(game, 3)
					yield* playCardFromHand(game, Emerald, 'single_use')
					yield* applyEffect(game)

					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(3),
					)

					yield* endTurn(game)

					expect(game.currentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health - Cubfan135Rare.secondary.damage,
					)
					expect(
						game.components.find(
							CardComponent,
							query.card.is(TurtleShell),
							query.card.currentPlayer,
							query.card.attached,
						),
					).not.toBe(null)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Loose Shell effect is removed when Turtle Shell or attached hermit is moved', () => {
		testGame(
			{
				playerOneDeck: [
					GeminiTayRare,
					GeminiTayRare,
					TurtleShell,
					Ladder,
					Mending,
					Ladder,
					Ladder,
					Ladder,
				],
				playerTwoDeck: [GrianRare, Emerald],
				saga: function* (game) {
					yield* playCardFromHand(game, GeminiTayRare, 'hermit', 0)
					yield* playCardFromHand(game, GeminiTayRare, 'hermit', 1)
					yield* playCardFromHand(game, TurtleShell, 'attach', 1)

					yield* endTurn(game)

					yield* playCardFromHand(game, GrianRare, 'hermit', 0)

					yield* endTurn(game)

					yield* playCardFromHand(game, Ladder, 'single_use')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					// Test Mending removes indicator
					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(LooseShellEffect),
							query.effect.targetIsCardAnd(query.card.currentPlayer),
						),
					).not.toBe(null)

					yield* attack(game, 'secondary')
					yield* playCardFromHand(game, Mending, 'single_use')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.attach,
						query.slot.rowIndex(0),
					)

					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(LooseShellEffect),
							query.effect.targetIsCardAnd(query.card.currentPlayer),
						),
					).toBe(null)

					yield* endTurn(game)
					yield* endTurn(game)

					yield* playCardFromHand(game, Ladder, 'single_use')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					// Test Ladder removes indicator
					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(LooseShellEffect),
							query.effect.targetIsCardAnd(query.card.currentPlayer),
						),
					).not.toBe(null)

					yield* attack(game, 'secondary')
					yield* playCardFromHand(game, Ladder, 'single_use')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)

					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(LooseShellEffect),
							query.effect.targetIsCardAnd(query.card.currentPlayer),
						),
					).toBe(null)

					// Test Borrow removes indicator
					yield* endTurn(game)
					yield* endTurn(game)
					yield* playCardFromHand(game, Ladder, 'single_use')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)

					let oldEffect = game.components.find(
						StatusEffectComponent,
						query.effect.is(LooseShellEffect),
						query.effect.targetIsCardAnd(query.card.currentPlayer),
					)

					expect(oldEffect).not.toBe(null)

					yield* endTurn(game)

					yield* attack(game, 'primary')
					expect(
						(game.state.modalRequests[0].modal as SelectCards.Data)
							.primaryButton,
					).toBeTruthy()
					// If `primaryButton` is null, Grian may not attach borrowed Turtle Shells
					yield* finishModalRequest(game, {result: true, cards: null})

					expect(oldEffect?.targetEntity).toBe(null)

					// Test Emerald removes indicator

					oldEffect = game.components.find(
						StatusEffectComponent,
						query.effect.is(LooseShellEffect),
						query.effect.targetIsCardAnd(query.card.currentPlayer),
					)
					expect(oldEffect).not.toBe(null)

					yield* endTurn(game)
					yield* endTurn(game)

					yield* playCardFromHand(game, Emerald, 'single_use')
					yield* applyEffect(game)

					expect(oldEffect?.targetEntity).toBe(null)

					// Test manually changing active hermit
					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(LooseShellEffect),
							query.effect.targetIsCardAnd(query.card.opponentPlayer),
						),
					).not.toBe(null)

					yield* endTurn(game)

					yield* changeActiveHermit(game, 1)

					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(LooseShellEffect),
							query.effect.targetIsCardAnd(query.card.currentPlayer),
						),
					).toBe(null)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})
})
