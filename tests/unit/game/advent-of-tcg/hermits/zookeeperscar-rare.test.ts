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
import {
	applyEffect,
	attack,
	changeActiveHermit,
	endTurn,
	finishModalRequest,
	pick,
	playCardFromHand,
	testGame,
} from '../../utils'

describe('Test Zookeeper Scar', () => {
	test('Effect not duplicated when attached to Zookeeper Scar', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [
					ZookeeperScarRare,
					Cat,
					...Array(40).fill(EthosLabCommon),
				],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, ZookeeperScarRare, 'hermit', 0)
					yield* playCardFromHand(game, Cat, 'attach', 0)
					yield* attack(game, 'secondary')
					expect(game.state.modalRequests.length).toStrictEqual(1)
				},
			},
			{noItemRequirements: true},
		)
	})

	test('Effect doubles and detaches', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, ZookeeperScarRare, Wolf],
				playerTwoDeck: [EthosLabCommon, Emerald],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, Wolf, 'attach', 0)
					yield* playCardFromHand(game, ZookeeperScarRare, 'hermit', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* attack(game, 'primary')
					expect(game.currentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health - 2 * 20,
					) // Wolf attached to Etho & Wolf attached to
					yield* endTurn(game)

					yield* endTurn(game)

					yield* playCardFromHand(game, Emerald, 'single_use')
					yield* applyEffect(game)
					yield* attack(game, 'primary')
					expect(game.currentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health - 2 * 20,
					) // No further damage
				},
			},
			{noItemRequirements: true},
		)
	})

	test('Lasso can stack Cat functionality', () => {
		testGame(
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
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, ZookeeperScarRare, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, Cat, 'attach', 0)
					yield* playCardFromHand(game, Cat, 'attach', 1)
					yield* attack(game, 'secondary')
					expect(game.state.modalRequests).toHaveLength(2)
					expect(
						game.currentPlayer
							.getDrawPile()
							.sort(CardComponent.compareOrder)
							.at(0)?.props,
					).toStrictEqual(BalancedItem)
					yield* finishModalRequest(game, {result: true, cards: null})
					expect(
						game.currentPlayer
							.getDrawPile()
							.sort(CardComponent.compareOrder)
							.at(0)?.props,
					).toStrictEqual(EthosLabCommon)
					yield* finishModalRequest(game, {result: false, cards: null})
					yield* endTurn(game)
				},
			},
			{startWithAllCards: false, noItemRequirements: true},
		)
	})

	test('Lasso + Elder Guardian functionality', () => {
		testGame(
			{
				playerOneDeck: [ZookeeperScarRare, EthosLabCommon, ElderGuardian],
				playerTwoDeck: [EthosLabCommon],
				saga: function* (game) {
					yield* playCardFromHand(game, ZookeeperScarRare, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, ElderGuardian, 'attach', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* attack(game, 'primary')
					expect(
						game.components.filter(
							StatusEffectComponent,
							query.effect.is(SingleTurnMiningFatigueEffect),
							query.effect.targetIsCardAnd(query.card.currentPlayer),
						).length,
					).toBe(1)
					yield* endTurn(game)
				},
			},
			{noItemRequirements: true},
		)
	})

	test('Mending Cat from active Zookeeper Scar', () => {
		testGame(
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
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, ZookeeperScarRare, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, Cat, 'attach', 0)
					yield* playCardFromHand(game, Mending, 'single_use')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.attach,
						query.slot.rowIndex(1),
					)
					yield* attack(game, 'secondary')
					expect(game.state.modalRequests).toHaveLength(1)
					expect(
						game.currentPlayer
							.getDrawPile()
							.sort(CardComponent.compareOrder)
							.at(0)?.props,
					).toStrictEqual(BalancedItem)
					yield* finishModalRequest(game, {result: true, cards: null})
					expect(
						game.currentPlayer
							.getDrawPile()
							.sort(CardComponent.compareOrder)
							.at(0)?.props,
					).toStrictEqual(Cat)
					yield* endTurn(game)
				},
			},
			{startWithAllCards: false, noItemRequirements: true},
		)
	})

	test('Moving Zookeeper Scar from Cat using Ladder', () => {
		testGame(
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
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, ZookeeperScarRare, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, Cat, 'attach', 0)
					yield* playCardFromHand(game, Ladder, 'single_use')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* attack(game, 'secondary')
					expect(game.state.modalRequests).toHaveLength(1)
					expect(
						game.currentPlayer
							.getDrawPile()
							.sort(CardComponent.compareOrder)
							.at(0)?.props,
					).toStrictEqual(BalancedItem)
					yield* finishModalRequest(game, {result: true, cards: null})
					expect(
						game.currentPlayer
							.getDrawPile()
							.sort(CardComponent.compareOrder)
							.at(0)?.props,
					).toStrictEqual(Cat)
					yield* endTurn(game)
				},
			},
			{startWithAllCards: false, noItemRequirements: true},
		)
	})

	test('Rendog cannot mock Lasso with Roleplay', () => {
		testGame(
			{
				playerOneDeck: [ZookeeperScarRare],
				playerTwoDeck: [
					RendogRare,
					EthosLabCommon,
					Cat,
					...Array(7).fill(BalancedItem),
				],
				saga: function* (game) {
					yield* playCardFromHand(game, ZookeeperScarRare, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, RendogRare, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, Cat, 'attach', 1)
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
					).not.toContain('primary')
					yield* finishModalRequest(game, {pick: 'secondary'})
					expect(game.state.modalRequests).toStrictEqual([])
					yield* endTurn(game)
				},
			},
			{noItemRequirements: true},
		)
	})

	test('Evil Xisuma cannot attempt to disable Lasso with Derpcoin', () => {
		testGame(
			{
				playerOneDeck: [ZookeeperScarRare],
				playerTwoDeck: [EvilXisumaRare],
				saga: function* (game) {
					yield* playCardFromHand(game, ZookeeperScarRare, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, EvilXisumaRare, 'hermit', 0)
					yield* attack(game, 'secondary')
					expect(
						(game.state.modalRequests[0].modal as CopyAttack.Data)
							.availableAttacks,
					).not.toContain('primary')
					yield* finishModalRequest(game, {pick: 'secondary'})
					expect(game.state.modalRequests).toStrictEqual([])
					yield* endTurn(game)
				},
			},
			{noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Golden Axe disables Wolf + Lasso when Wolf is attached to active', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, ZookeeperScarRare, Wolf],
				playerTwoDeck: [EthosLabCommon, GoldenAxe, GoldenAxe],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, Wolf, 'attach', 0)
					yield* playCardFromHand(game, ZookeeperScarRare, 'hermit', 1)
					yield* changeActiveHermit(game, 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, GoldenAxe, 'single_use')
					yield* attack(game, 'single-use')
					expect(game.currentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health - 2 * 20,
					) // Wolf attached to Etho & Wolf "attached" to Scar
					yield* endTurn(game)

					yield* changeActiveHermit(game, 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, GoldenAxe, 'single_use')
					yield* attack(game, 'single-use')
					expect(game.currentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health - 2 * 20,
					) // No further damage
				},
			},
			{noItemRequirements: true},
		)
	})
})
