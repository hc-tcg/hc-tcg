import {describe, expect, test} from '@jest/globals'
import Trapdoor from 'common/cards/advent-of-tcg/effects/trapdoor'
import SplashPotionOfHarming from 'common/cards/advent-of-tcg/single-use/splash-potion-of-harming'
import SpookyStressRare from 'common/cards/alter-egos-iii/hermits/spookystress-rare'
import LightningRod from 'common/cards/alter-egos/effects/lightning-rod'
import GoatfatherRare from 'common/cards/alter-egos/hermits/goatfather-rare'
import Anvil from 'common/cards/alter-egos/single-use/anvil'
import EnderPearl from 'common/cards/alter-egos/single-use/ender-pearl'
import TargetBlock from 'common/cards/alter-egos/single-use/target-block'
import IronArmor from 'common/cards/default/effects/iron-armor'
import WaterBucket from 'common/cards/default/effects/water-bucket'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import Iskall85Common from 'common/cards/default/hermits/iskall85-common'
import VintageBeefCommon from 'common/cards/default/hermits/vintagebeef-common'
import NetheriteSword from 'common/cards/default/single-use/netherite-sword'
import {RowComponent} from 'common/components'
import query from 'common/components/query'
import {attack, endTurn, pick, playCardFromHand, testGame} from '../../utils'

describe('Test Trapdoor', () => {
	test('Trapdoor functionality', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, Trapdoor],
				playerTwoDeck: [Iskall85Common, NetheriteSword],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, Trapdoor, 'attach', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, Iskall85Common, 'hermit', 0)
					yield* attack(game, 'secondary')
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(EthosLabCommon.health - (Iskall85Common.secondary.damage - 40))
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(EthosLabCommon.health - 40)
					yield* endTurn(game)

					yield* endTurn(game)

					yield* playCardFromHand(game, NetheriteSword, 'single_use')
					yield* attack(game, 'single-use')
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(
						EthosLabCommon.health -
							(Iskall85Common.secondary.damage - 40) -
							(60 - 40) /** Netherite Sword */,
					)
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(EthosLabCommon.health - 80)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Anvil attacks rows in order', () => {
		testGame(
			{
				playerOneDeck: [
					EthosLabCommon,
					IronArmor,
					EthosLabCommon,
					EnderPearl,
					Trapdoor,
					EthosLabCommon,
				],
				playerTwoDeck: [VintageBeefCommon, Anvil],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 2)
					yield* playCardFromHand(game, IronArmor, 'attach', 2)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, EnderPearl, 'single_use')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 2)
					yield* playCardFromHand(game, Trapdoor, 'attach', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, VintageBeefCommon, 'hermit', 0)
					yield* playCardFromHand(game, Anvil, 'single_use')
					yield* attack(game, 'primary')
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(EthosLabCommon.health)
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(EthosLabCommon.health - 50)
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(2),
						)?.health,
					).toBe(EthosLabCommon.health - 10)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Spooky Stress attacks rows in order', () => {
		testGame(
			{
				playerOneDeck: [
					EthosLabCommon,
					IronArmor,
					EthosLabCommon,
					EthosLabCommon,
					EnderPearl,
					Trapdoor,
					EthosLabCommon,
				],
				playerTwoDeck: [SpookyStressRare, WaterBucket, Anvil],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 3)
					yield* playCardFromHand(game, IronArmor, 'attach', 3)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 2)
					yield* playCardFromHand(game, EnderPearl, 'single_use')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 3)
					yield* playCardFromHand(game, Trapdoor, 'attach', 2)
					yield* endTurn(game)

					yield* playCardFromHand(game, SpookyStressRare, 'hermit', 3)
					yield* playCardFromHand(game, WaterBucket, 'attach', 3)
					yield* playCardFromHand(game, Anvil, 'single_use')
					yield* attack(game, 'secondary')
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(
						EthosLabCommon.health -
							(SpookyStressRare.secondary.damage - 20) /** Iron Armor */,
					)
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(EthosLabCommon.health)
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(2),
						)?.health,
					).toBe(EthosLabCommon.health - 50)
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(3),
						)?.health,
					).toBe(EthosLabCommon.health - 10)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Anvil Drop attacks rows in order', () => {
		testGame(
			{
				playerOneDeck: [
					EthosLabCommon,
					IronArmor,
					EthosLabCommon,
					EthosLabCommon,
					EnderPearl,
					Trapdoor,
					EthosLabCommon,
				],
				playerTwoDeck: [GoatfatherRare, Anvil],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 3)
					yield* playCardFromHand(game, IronArmor, 'attach', 3)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 2)
					yield* playCardFromHand(game, EnderPearl, 'single_use')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 3)
					yield* playCardFromHand(game, Trapdoor, 'attach', 2)
					yield* endTurn(game)

					yield* playCardFromHand(game, GoatfatherRare, 'hermit', 3)
					yield* playCardFromHand(game, Anvil, 'single_use')
					yield* attack(game, 'secondary')
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(
						EthosLabCommon.health -
							(GoatfatherRare.secondary.damage +
								30 /** Heads damage */ -
								20) /** Iron Armor */,
					)
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(EthosLabCommon.health)
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(2),
						)?.health,
					).toBe(EthosLabCommon.health - 50)
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(3),
						)?.health,
					).toBe(EthosLabCommon.health - 10)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Splash Harming attacks rows in order', () => {
		testGame(
			{
				playerOneDeck: [
					EthosLabCommon,
					IronArmor,
					EthosLabCommon,
					EnderPearl,
					Trapdoor,
					EthosLabCommon,
				],
				playerTwoDeck: [VintageBeefCommon, SplashPotionOfHarming],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 2)
					yield* playCardFromHand(game, IronArmor, 'attach', 2)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, EnderPearl, 'single_use')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 2)
					yield* playCardFromHand(game, Trapdoor, 'attach', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, VintageBeefCommon, 'hermit', 0)
					yield* playCardFromHand(game, SplashPotionOfHarming, 'single_use')
					yield* attack(game, 'primary')
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(EthosLabCommon.health - 10)
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(EthosLabCommon.health - 60)
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(2),
						)?.health,
					).toBe(EthosLabCommon.health - 20)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Trapdoor priority vs Lightning Rod/Target Block', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, Trapdoor, LightningRod],
				playerTwoDeck: [Iskall85Common, TargetBlock],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, Trapdoor, 'attach', 0)
					yield* playCardFromHand(game, LightningRod, 'attach', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, Iskall85Common, 'hermit', 0)
					yield* attack(game, 'primary')
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(EthosLabCommon.health - 40)
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(EthosLabCommon.health - (Iskall85Common.primary.damage - 40))
					yield* endTurn(game)

					yield* endTurn(game)

					yield* playCardFromHand(game, TargetBlock, 'single_use')
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* attack(game, 'primary')
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(EthosLabCommon.health - 40)
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(
						EthosLabCommon.health -
							(Iskall85Common.primary.damage - 40) -
							Iskall85Common.primary.damage,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Multiple Trapdoors at once', () => {
		testGame(
			{
				playerOneDeck: [
					...Array(4).fill(EthosLabCommon),
					...Array(3).fill(Trapdoor),
				],
				playerTwoDeck: [VintageBeefCommon],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 2)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 3)
					yield* playCardFromHand(game, Trapdoor, 'attach', 0)
					yield* playCardFromHand(game, Trapdoor, 'attach', 1)
					yield* playCardFromHand(game, Trapdoor, 'attach', 3)
					yield* endTurn(game)

					yield* playCardFromHand(game, VintageBeefCommon, 'hermit', 0)
					yield* attack(game, 'secondary')
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(EthosLabCommon.health - 40 /** Chained interception */)
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(EthosLabCommon.health)
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(2),
						)?.health,
					).toBe(EthosLabCommon.health)
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(3),
						)?.health,
					).toBe(
						EthosLabCommon.health - (VintageBeefCommon.secondary.damage - 40),
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
