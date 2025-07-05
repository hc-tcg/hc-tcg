import {describe, expect, test} from '@jest/globals'
import Cat from 'common/cards/advent-of-tcg/attach/cat'
import ElderGuardian from 'common/cards/advent-of-tcg/attach/elder-guardian'
import ZookeeperScarRare from 'common/cards/advent-of-tcg/hermits/zookeeperscar-rare'
import Wolf from 'common/cards/attach/wolf'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import EvilXisumaRare from 'common/cards/hermits/evilxisuma_rare'
import RendogRare from 'common/cards/hermits/rendog-rare'
import BalancedItem from 'common/cards/items/balanced-common'
import Emerald from 'common/cards/single-use/emerald'
import GoldenAxe from 'common/cards/single-use/golden-axe'
import Ladder from 'common/cards/single-use/ladder'
import Mending from 'common/cards/single-use/mending'
import {CardComponent, StatusEffectComponent} from 'common/components'
import query from 'common/components/query'
import {SingleTurnMiningFatigueEffect} from 'common/status-effects/mining-fatigue'
import {CopyAttack} from 'common/types/modal-requests'
import {testGame} from '../../utils'

describe('Test Zookeeper Scar', () => {
	test('Effect not duplicated when attached to Zookeeper Scar', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [
					ZookeeperScarRare,
					Cat,
					...Array(40).fill(EthosLabCommon),
				],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(ZookeeperScarRare, 'hermit', 0)
					await test.playCardFromHand(Cat, 'attach', 0)
					await test.attack('secondary')
					expect(game.state.modalRequests.length).toStrictEqual(1)
				},
			},
			{noItemRequirements: true},
		)
	})

	test('Effect doubles and detaches', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, ZookeeperScarRare, Wolf],
				playerTwoDeck: [EthosLabCommon, Emerald],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(Wolf, 'attach', 0)
					await test.playCardFromHand(ZookeeperScarRare, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.attack('primary')
					expect(game.currentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health - 2 * 20,
					) // Wolf attached to Etho & Wolf attached to
					await test.endTurn()

					await test.endTurn()

					await test.playCardFromHand(Emerald, 'single_use')
					await test.applyEffect()
					await test.attack('primary')
					expect(game.currentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health - 2 * 20,
					) // No further damage
				},
			},
			{noItemRequirements: true},
		)
	})

	test('Lasso can stack Cat functionality', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [
					ZookeeperScarRare,
					EthosLabCommon,
					Cat,
					Cat,
					...Array(5).fill(BalancedItem),
					EthosLabCommon,
				],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(ZookeeperScarRare, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(Cat, 'attach', 0)
					await test.playCardFromHand(Cat, 'attach', 1)
					await test.attack('secondary')
					expect(game.state.modalRequests).toHaveLength(2)
					expect(
						game.currentPlayer
							.getDrawPile()
							.sort(CardComponent.compareOrder)
							.at(0)?.props,
					).toStrictEqual(BalancedItem)
					await test.finishModalRequest({result: true, cards: null})
					expect(
						game.currentPlayer
							.getDrawPile()
							.sort(CardComponent.compareOrder)
							.at(0)?.props,
					).toStrictEqual(EthosLabCommon)
					await test.finishModalRequest({result: false, cards: null})
					await test.endTurn()
				},
			},
			{startWithAllCards: false, noItemRequirements: true},
		)
	})

	test('Lasso + Elder Guardian functionality', async () => {
		await testGame(
			{
				playerOneDeck: [ZookeeperScarRare, EthosLabCommon, ElderGuardian],
				playerTwoDeck: [EthosLabCommon],
				testGame: async (test, game) => {
					await test.playCardFromHand(ZookeeperScarRare, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(ElderGuardian, 'attach', 1)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.attack('primary')
					expect(
						game.components.filter(
							StatusEffectComponent,
							query.effect.is(SingleTurnMiningFatigueEffect),
							query.effect.targetIsCardAnd(query.card.currentPlayer),
						).length,
					).toBe(1)
					await test.endTurn()
				},
			},
			{noItemRequirements: true},
		)
	})

	test('Mending Cat from active Zookeeper Scar', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [
					ZookeeperScarRare,
					EthosLabCommon,
					Cat,
					Mending,
					...Array(5).fill(BalancedItem),
					Cat,
				],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(ZookeeperScarRare, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(Cat, 'attach', 0)
					await test.playCardFromHand(Mending, 'single_use')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.attach,
						query.slot.rowIndex(1),
					)
					await test.attack('secondary')
					expect(game.state.modalRequests).toHaveLength(1)
					expect(
						game.currentPlayer
							.getDrawPile()
							.sort(CardComponent.compareOrder)
							.at(0)?.props,
					).toStrictEqual(BalancedItem)
					await test.finishModalRequest({result: true, cards: null})
					expect(
						game.currentPlayer
							.getDrawPile()
							.sort(CardComponent.compareOrder)
							.at(0)?.props,
					).toStrictEqual(Cat)
					await test.endTurn()
				},
			},
			{startWithAllCards: false, noItemRequirements: true},
		)
	})

	test('Moving Zookeeper Scar from Cat using Ladder', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [
					ZookeeperScarRare,
					EthosLabCommon,
					Cat,
					Ladder,
					...Array(5).fill(BalancedItem),
					Cat,
				],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(ZookeeperScarRare, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(Cat, 'attach', 0)
					await test.playCardFromHand(Ladder, 'single_use')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.attack('secondary')
					expect(game.state.modalRequests).toHaveLength(1)
					expect(
						game.currentPlayer
							.getDrawPile()
							.sort(CardComponent.compareOrder)
							.at(0)?.props,
					).toStrictEqual(BalancedItem)
					await test.finishModalRequest({result: true, cards: null})
					expect(
						game.currentPlayer
							.getDrawPile()
							.sort(CardComponent.compareOrder)
							.at(0)?.props,
					).toStrictEqual(Cat)
					await test.endTurn()
				},
			},
			{startWithAllCards: false, noItemRequirements: true},
		)
	})

	test('Rendog cannot mock Lasso with Roleplay', async () => {
		await testGame(
			{
				playerOneDeck: [ZookeeperScarRare],
				playerTwoDeck: [
					RendogRare,
					EthosLabCommon,
					Cat,
					...Array(7).fill(BalancedItem),
				],
				testGame: async (test, game) => {
					await test.playCardFromHand(ZookeeperScarRare, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(RendogRare, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(Cat, 'attach', 1)
					await test.attack('secondary')
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					expect(
						(game.state.modalRequests[0].modal as CopyAttack.Data)
							.availableAttacks,
					).not.toContain('primary')
					await test.finishModalRequest({pick: 'secondary'})
					expect(game.state.modalRequests).toStrictEqual([])
					await test.endTurn()
				},
			},
			{noItemRequirements: true},
		)
	})

	test('Evil Xisuma cannot attempt to disable Lasso with Derpcoin', async () => {
		await testGame(
			{
				playerOneDeck: [ZookeeperScarRare],
				playerTwoDeck: [EvilXisumaRare],
				testGame: async (test, game) => {
					await test.playCardFromHand(ZookeeperScarRare, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(EvilXisumaRare, 'hermit', 0)
					await test.attack('secondary')
					expect(
						(game.state.modalRequests[0].modal as CopyAttack.Data)
							.availableAttacks,
					).not.toContain('primary')
					await test.finishModalRequest({pick: 'secondary'})
					expect(game.state.modalRequests).toStrictEqual([])
					await test.endTurn()
				},
			},
			{noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Golden Axe disables Wolf + Lasso when Wolf is attached to active', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, ZookeeperScarRare, Wolf],
				playerTwoDeck: [EthosLabCommon, GoldenAxe, GoldenAxe],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(Wolf, 'attach', 0)
					await test.playCardFromHand(ZookeeperScarRare, 'hermit', 1)
					await test.changeActiveHermit(1)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(GoldenAxe, 'single_use')
					await test.attack('single-use')
					expect(game.currentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health - 2 * 20,
					) // Wolf attached to Etho & Wolf "attached" to Scar
					await test.endTurn()

					await test.changeActiveHermit(0)
					await test.endTurn()

					await test.playCardFromHand(GoldenAxe, 'single_use')
					await test.attack('single-use')
					expect(game.currentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health - 2 * 20,
					) // No further damage
				},
			},
			{noItemRequirements: true},
		)
	})
})
