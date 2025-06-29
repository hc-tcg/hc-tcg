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
import {testGame} from '../utils'

describe('Test Turtle Shell', () => {
	test('Turtle Shell applies to next turn', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, FarmerBeefCommon, TurtleShell],
				playerTwoDeck: [ZombieCleoCommon],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(FarmerBeefCommon, 'hermit', 1)
					await test.playCardFromHand(TurtleShell, 'attach', 1)

					await test.changeActiveHermit(1)

					await test.endTurn()

					await test.playCardFromHand(ZombieCleoCommon, 'hermit', 0)
					await test.attack('secondary')

					await test.endTurn()

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

	test('Turtle Shell protects against Gas Light and Egg, but not status-effect damage', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, FarmerBeefCommon, TurtleShell],
				playerTwoDeck: [SkizzlemanRare, LavaBucket, Egg],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(FarmerBeefCommon, 'hermit', 1)

					await test.endTurn()

					await test.playCardFromHand(SkizzlemanRare, 'hermit', 0)

					await test.playCardFromHand(LavaBucket, 'single_use')
					await test.applyEffect()

					await test.endTurn()

					await test.changeActiveHermit(1)

					await test.endTurn()
					await test.endTurn()

					await test.playCardFromHand(TurtleShell, 'attach', 0)

					await test.endTurn()

					await test.playCardFromHand(Egg, 'single_use')
					await test.attack('secondary')

					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)

					await test.endTurn()

					expect(game.currentPlayer.activeRow?.index).toBe(0)
					expect(game.currentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health - 60 /* 3x Burn damage*/,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Turtle Shell is not discarded when row is activated by Knockback', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, FarmerBeefCommon, TurtleShell],
				playerTwoDeck: [ZombieCleoCommon, Knockback],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(FarmerBeefCommon, 'hermit', 1)
					await test.playCardFromHand(TurtleShell, 'attach', 1)

					await test.endTurn()

					await test.playCardFromHand(ZombieCleoCommon, 'hermit', 0)
					await test.playCardFromHand(Knockback, 'single_use')
					await test.attack('secondary')

					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)

					await test.endTurn()

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

	test("Turtle Shell works with Ladder only on hermit's first turn active", async () => {
		await testGame(
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
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(TurtleShell, 'attach', 1)

					await test.playCardFromHand(Ladder, 'single_use')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)

					await test.endTurn()

					await test.playCardFromHand(ZombieCleoCommon, 'hermit', 0)
					await test.attack('secondary')

					await test.endTurn()

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

					await test.playCardFromHand(TurtleShell, 'attach', 0)

					await test.playCardFromHand(Ladder, 'single_use')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)

					await test.endTurn()

					await test.attack('secondary')

					await test.endTurn()

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

	test('Ladder deactivates Turtle Shell after active moves', async () => {
		await testGame(
			{
				playerOneDeck: [
					ArmorStand,
					EthosLabCommon,
					EthosLabCommon,
					TurtleShell,
					Ladder,
				],
				playerTwoDeck: [ZombieCleoCommon],
				testGame: async (test, game) => {
					await test.playCardFromHand(ArmorStand, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 2)
					await test.playCardFromHand(TurtleShell, 'attach', 1)

					await test.endTurn()

					await test.playCardFromHand(ZombieCleoCommon, 'hermit', 0)
					await test.attack('secondary')

					await test.endTurn()

					await test.changeActiveHermit(1)
					await test.playCardFromHand(Ladder, 'single_use')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(2),
					)

					await test.endTurn()

					await test.attack('secondary')

					await test.endTurn()

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

	test('Mending deactivates moved Turtle Shell', async () => {
		await testGame(
			{
				playerOneDeck: [
					ArmorStand,
					EthosLabCommon,
					FarmerBeefCommon,
					TurtleShell,
					Mending,
				],
				playerTwoDeck: [ZombieCleoCommon],
				testGame: async (test, game) => {
					await test.playCardFromHand(ArmorStand, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(FarmerBeefCommon, 'hermit', 2)
					await test.playCardFromHand(TurtleShell, 'attach', 1)

					await test.endTurn()

					await test.playCardFromHand(ZombieCleoCommon, 'hermit', 0)
					await test.attack('secondary')

					await test.endTurn()

					await test.changeActiveHermit(1)
					await test.playCardFromHand(Mending, 'single_use')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.attach,
						query.slot.rowIndex(2),
					)

					await test.endTurn()

					await test.attack('secondary')

					await test.endTurn()

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

	test('Turtle Shell is still discarded when row is deactivated by Knockback', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, FarmerBeefCommon, TurtleShell],
				playerTwoDeck: [ZombieCleoCommon, Knockback],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(FarmerBeefCommon, 'hermit', 1)
					await test.playCardFromHand(TurtleShell, 'attach', 1)
					await test.changeActiveHermit(1)

					await test.endTurn()

					await test.playCardFromHand(ZombieCleoCommon, 'hermit', 0)
					await test.playCardFromHand(Knockback, 'single_use')
					await test.attack('secondary')

					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)

					await test.endTurn()

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

	test('Correct Turtle Shell is discarded after defending against Peace Out + Egg', async () => {
		await testGame(
			{
				playerOneDeck: [
					ArmorStand,
					EthosLabCommon,
					FarmerBeefCommon,
					TurtleShell,
					TurtleShell,
				],
				playerTwoDeck: [IJevinRare, Egg],
				testGame: async (test, game) => {
					await test.playCardFromHand(ArmorStand, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(FarmerBeefCommon, 'hermit', 2)
					await test.playCardFromHand(TurtleShell, 'attach', 1)
					await test.playCardFromHand(TurtleShell, 'attach', 2)
					await test.changeActiveHermit(1)

					await test.endTurn()

					await test.playCardFromHand(IJevinRare, 'hermit', 0)
					await test.playCardFromHand(Egg, 'single_use')
					await test.attack('secondary')

					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(2),
					)
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)

					await test.endTurn()

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

					await test.endTurn()
					await test.endTurn()
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

	test("Turtle Shell works after previous active was KO'd by Extra Flee", async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, FarmerBeefCommon, TurtleShell],
				playerTwoDeck: [TangoTekRare],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(TangoTekRare, 'hermit', 0)
					await test.attack('secondary')
					await test.endTurn()

					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

					await test.playCardFromHand(FarmerBeefCommon, 'hermit', 1)
					await test.playCardFromHand(TurtleShell, 'attach', 1)
					await test.endTurn()

					await test.attack('secondary')
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.endTurn()

					await test.endTurn()

					await test.attack('secondary')
					await test.endTurn()

					expect(game.currentPlayer.activeRow?.health).toBe(
						FarmerBeefCommon.health,
					)
					expect(game.currentPlayer.activeRow?.getAttach()).toBe(null)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test("Turtle Shells borrowed by Grian only work on Grian's first turn", async () => {
		await testGame(
			{
				playerOneDeck: [
					EthosLabCommon,
					EthosLabCommon,
					TurtleShell,
					TurtleShell,
					ChorusFruit,
				],
				playerTwoDeck: [GrianRare],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(TurtleShell, 'attach', 1)
					await test.changeActiveHermit(1)

					await test.endTurn()

					await test.playCardFromHand(GrianRare, 'hermit', 0)
					await test.attack('primary')
					expect(
						(game.state.modalRequests[0].modal as SelectCards.Data)
							.primaryButton,
					).toBeTruthy()
					// If `primaryButton` is null, Grian may not attach borrowed Turtle Shells
					await test.finishModalRequest({result: true, cards: null})

					await test.endTurn()

					await test.playCardFromHand(TurtleShell, 'attach', 0)
					await test.playCardFromHand(ChorusFruit, 'single_use')
					await test.attack('secondary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)

					await test.endTurn()

					expect(
						game.components.find(
							CardComponent,
							query.card.is(TurtleShell),
							query.card.currentPlayer,
							query.card.slot(query.slot.discardPile),
						),
					).not.toBe(null)
					expect(game.currentPlayer.activeRow?.health).toBe(GrianRare.health)

					await test.attack('primary')
					await test.finishModalRequest({result: true, cards: null})

					await test.endTurn()

					await test.attack('secondary')

					await test.endTurn()

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

	test("Turtle Shells taken by Emerald only work on destination hermit's first turn", async () => {
		await testGame(
			{
				playerOneDeck: [
					EthosLabCommon,
					EthosLabCommon,
					TurtleShell,
					TurtleShell,
					ChorusFruit,
				],
				playerTwoDeck: [ZombieCleoCommon, Emerald, Emerald],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(TurtleShell, 'attach', 1)
					await test.changeActiveHermit(1)

					await test.endTurn()

					await test.playCardFromHand(ZombieCleoCommon, 'hermit', 0)
					expect(game.getPickableSlots(Emerald.attachCondition).at(0)).not.toBe(
						undefined,
					) // Check if Emerald can move Turtle Shells
					await test.playCardFromHand(Emerald, 'single_use')
					await test.applyEffect()

					await test.endTurn()

					await test.playCardFromHand(TurtleShell, 'attach', 0)
					await test.playCardFromHand(ChorusFruit, 'single_use')
					await test.attack('secondary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)

					await test.endTurn()

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

					await test.playCardFromHand(Emerald, 'single_use')
					await test.applyEffect()

					await test.endTurn()

					await test.attack('secondary')

					await test.endTurn()

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

	test("Turtle Shells given by Emerald only work on destination hermit's first turn", async () => {
		await testGame(
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
				testGame: async (test, game) => {
					await test.playCardFromHand(ArmorStand, 'hermit', 0)
					await test.playCardFromHand(Cubfan135Rare, 'hermit', 1)
					await test.playCardFromHand(TurtleShell, 'attach', 1)
					await test.playCardFromHand(ArmorStand, 'hermit', 2)
					await test.playCardFromHand(Cubfan135Rare, 'hermit', 3)
					await test.playCardFromHand(TurtleShell, 'attach', 3)

					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.attack('secondary')

					await test.endTurn()

					await test.changeActiveHermit(1)
					expect(game.getPickableSlots(Emerald.attachCondition).at(0)).not.toBe(
						undefined,
					) // Check if Emerald can move Turtle Shells
					await test.playCardFromHand(Emerald, 'single_use')
					await test.applyEffect()

					await test.attack('secondary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(2),
					)

					await test.endTurn()

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

					await test.attack('secondary')

					await test.endTurn()

					await test.changeActiveHermit(3)
					await test.playCardFromHand(Emerald, 'single_use')
					await test.applyEffect()

					await test.attack('secondary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(3),
					)

					await test.endTurn()

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

	test('Loose Shell effect is removed when Turtle Shell or attached hermit is moved', async () => {
		await testGame(
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
				testGame: async (test, game) => {
					await test.playCardFromHand(GeminiTayRare, 'hermit', 0)
					await test.playCardFromHand(GeminiTayRare, 'hermit', 1)
					await test.playCardFromHand(TurtleShell, 'attach', 1)

					await test.endTurn()

					await test.playCardFromHand(GrianRare, 'hermit', 0)

					await test.endTurn()

					await test.playCardFromHand(Ladder, 'single_use')
					await test.pick(
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

					await test.attack('secondary')
					await test.playCardFromHand(Mending, 'single_use')
					await test.pick(
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

					await test.endTurn()
					await test.endTurn()

					await test.playCardFromHand(Ladder, 'single_use')
					await test.pick(
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

					await test.attack('secondary')
					await test.playCardFromHand(Ladder, 'single_use')
					await test.pick(
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
					await test.endTurn()
					await test.endTurn()
					await test.playCardFromHand(Ladder, 'single_use')
					await test.pick(
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

					await test.endTurn()

					await test.attack('primary')
					expect(
						(game.state.modalRequests[0].modal as SelectCards.Data)
							.primaryButton,
					).toBeTruthy()
					// If `primaryButton` is null, Grian may not attach borrowed Turtle Shells
					await test.finishModalRequest({result: true, cards: null})

					expect(oldEffect?.targetEntity).toBe(null)

					// Test Emerald removes indicator

					oldEffect = game.components.find(
						StatusEffectComponent,
						query.effect.is(LooseShellEffect),
						query.effect.targetIsCardAnd(query.card.currentPlayer),
					)
					expect(oldEffect).not.toBe(null)

					await test.endTurn()
					await test.endTurn()

					await test.playCardFromHand(Emerald, 'single_use')
					await test.applyEffect()

					expect(oldEffect?.targetEntity).toBe(null)

					// Test manually changing active hermit
					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(LooseShellEffect),
							query.effect.targetIsCardAnd(query.card.opponentPlayer),
						),
					).not.toBe(null)

					await test.endTurn()

					await test.changeActiveHermit(1)

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
