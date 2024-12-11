import {describe, expect, test} from '@jest/globals'
import Trapdoor from 'common/cards/advent-of-tcg/attach/trapdoor'
import SplashPotionOfHarming from 'common/cards/advent-of-tcg/single-use/splash-potion-of-harming'
import {IronArmor} from 'common/cards/attach/armor'
import LightningRod from 'common/cards/attach/lightning-rod'
import {Thorns} from 'common/cards/attach/thorns'
import WaterBucket from 'common/cards/attach/water-bucket'
import Wolf from 'common/cards/attach/wolf'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import GoatfatherRare from 'common/cards/hermits/goatfather-rare'
import Iskall85Common from 'common/cards/hermits/iskall85-common'
import PoePoeSkizzRare from 'common/cards/hermits/poepoeskizz-rare'
import PrincessGemRare from 'common/cards/hermits/princessgem-rare'
import RenbobRare from 'common/cards/hermits/renbob-rare'
import SkizzlemanRare from 'common/cards/hermits/skizzleman-rare'
import SpookyStressRare from 'common/cards/hermits/spookystress-rare'
import VintageBeefCommon from 'common/cards/hermits/vintagebeef-common'
import Anvil from 'common/cards/single-use/anvil'
import BadOmen from 'common/cards/single-use/bad-omen'
import EnderPearl from 'common/cards/single-use/ender-pearl'
import InvisibilityPotion from 'common/cards/single-use/invisibility-potion'
import LavaBucket from 'common/cards/single-use/lava-bucket'
import PotionOfWeakness from 'common/cards/single-use/potion-of-weakness'
import {NetheriteSword} from 'common/cards/single-use/sword'
import TargetBlock from 'common/cards/single-use/target-block'
import {RowComponent} from 'common/components'
import query from 'common/components/query'
import {WEAKNESS_DAMAGE} from 'common/const/damage'
import {
	applyEffect,
	attack,
	changeActiveHermit,
	endTurn,
	pick,
	playCardFromHand,
	testGame,
} from '../../utils'

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
					expect(Anvil.attackPreview?.(game)).toBe('$A30$ + $A10$ x 2')
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
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, EnderPearl, 'single_use')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 2)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 3)
					yield* playCardFromHand(game, Trapdoor, 'attach', 3)
					yield* endTurn(game)

					yield* playCardFromHand(game, SpookyStressRare, 'hermit', 3)
					yield* playCardFromHand(game, WaterBucket, 'attach', 3)
					yield* playCardFromHand(game, Anvil, 'single_use')
					expect(Anvil.attackPreview?.(game)).toBe('$A30$')
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
					).toBe(EthosLabCommon.health - 10)
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
					).toBe(EthosLabCommon.health - 50)
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
					expect(Anvil.attackPreview?.(game)).toBe('$A30$')
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
					).toBe(EthosLabCommon.health - 20)
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(3),
						)?.health,
					).toBe(EthosLabCommon.health - 40)
				},
			},
			{
				startWithAllCards: true,
				noItemRequirements: true,
				forceCoinFlip: true,
			},
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

					yield* playCardFromHand(game, VintageBeefCommon, 'hermit', 1)
					yield* playCardFromHand(game, SplashPotionOfHarming, 'single_use')
					expect(SplashPotionOfHarming.attackPreview?.(game)).toBe(
						'$A40$ + $A20$ x 2',
					)
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
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, Trapdoor, 'attach', 1)
					yield* playCardFromHand(game, LightningRod, 'attach', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, Iskall85Common, 'hermit', 0)
					yield* attack(game, 'primary')
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(EthosLabCommon.health - (Iskall85Common.primary.damage - 40))
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(EthosLabCommon.health - 40)
					yield* endTurn(game)

					yield* endTurn(game)

					yield* playCardFromHand(game, TargetBlock, 'single_use')
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					yield* attack(game, 'primary')
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(EthosLabCommon.health - 40)
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
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
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 2)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 3)
					yield* playCardFromHand(game, Trapdoor, 'attach', 0)
					yield* playCardFromHand(game, Trapdoor, 'attach', 2)
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
					).toBe(EthosLabCommon.health)
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(
						EthosLabCommon.health - (VintageBeefCommon.secondary.damage - 40),
					)
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
					).toBe(EthosLabCommon.health - 40)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Wolf triggers when Trapdoor redirects all damage', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, Wolf, Trapdoor],
				playerTwoDeck: [VintageBeefCommon],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, Wolf, 'attach', 0)
					yield* playCardFromHand(game, Trapdoor, 'attach', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, VintageBeefCommon, 'hermit', 0)
					yield* attack(game, 'primary')
					expect(game.currentPlayer.activeRow?.health).toBe(
						VintageBeefCommon.health - 20 /** Wolf */,
					)
					expect(game.opponentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health,
					)
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(EthosLabCommon.health - VintageBeefCommon.primary.damage)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Thorns does not trigger when Trapdoor redirects all damage', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, Thorns, Trapdoor],
				playerTwoDeck: [VintageBeefCommon],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, Thorns, 'attach', 0)
					yield* playCardFromHand(game, Trapdoor, 'attach', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, VintageBeefCommon, 'hermit', 0)
					yield* attack(game, 'primary')
					expect(game.currentPlayer.activeRow?.health).toBe(
						VintageBeefCommon.health,
					)
					expect(game.opponentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health,
					)
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(EthosLabCommon.health - VintageBeefCommon.primary.damage)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Thorns triggers from Weakness damage when Trapdoor + Royal Protection blocks hermit damage', () => {
		testGame(
			{
				playerOneDeck: [VintageBeefCommon, PotionOfWeakness],
				playerTwoDeck: [PrincessGemRare, EthosLabCommon, Wolf, Trapdoor],
				saga: function* (game) {
					yield* playCardFromHand(game, VintageBeefCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, PrincessGemRare, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, Wolf, 'attach', 0)
					yield* playCardFromHand(game, Trapdoor, 'attach', 1)
					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* endTurn(game)

					yield* playCardFromHand(game, PotionOfWeakness, 'single_use')
					yield* applyEffect(game)
					yield* attack(game, 'primary')
					expect(game.currentPlayer.activeRow?.health).toBe(
						VintageBeefCommon.health -
							PrincessGemRare.secondary.damage -
							20 /** Wolf */,
					)
					expect(game.opponentPlayer.activeRow?.health).toBe(
						PrincessGemRare.health -
							(VintageBeefCommon.primary.damage - 40) /** Trapdoor */ -
							WEAKNESS_DAMAGE,
					)
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(EthosLabCommon.health)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Thorns triggers from Weakness damage when Trapdoor + Royal Protection blocks hermit damage', () => {
		testGame(
			{
				playerOneDeck: [VintageBeefCommon, PotionOfWeakness],
				playerTwoDeck: [PrincessGemRare, EthosLabCommon, Thorns, Trapdoor],
				saga: function* (game) {
					yield* playCardFromHand(game, VintageBeefCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, PrincessGemRare, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, Thorns, 'attach', 0)
					yield* playCardFromHand(game, Trapdoor, 'attach', 1)
					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					yield* endTurn(game)

					yield* playCardFromHand(game, PotionOfWeakness, 'single_use')
					yield* applyEffect(game)
					yield* attack(game, 'primary')
					expect(game.currentPlayer.activeRow?.health).toBe(
						VintageBeefCommon.health -
							PrincessGemRare.secondary.damage -
							20 /** Thorns */,
					)
					expect(game.opponentPlayer.activeRow?.health).toBe(
						PrincessGemRare.health -
							(VintageBeefCommon.primary.damage - 40) /** Trapdoor */ -
							WEAKNESS_DAMAGE,
					)
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(EthosLabCommon.health)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Trapdoor does not redirect when Renbob "Hyperspace" attacks an empty row', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, Trapdoor],
				playerTwoDeck: [RenbobRare],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, Trapdoor, 'attach', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, RenbobRare, 'hermit', 0)
					yield* attack(game, 'secondary')
					yield* endTurn(game)

					expect(game.currentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Trapdoor only redirects 40hp of Poe Poe Skizz "Jumpscare"', () => {
		testGame(
			{
				playerOneDeck: [
					EthosLabCommon,
					EthosLabCommon,
					EthosLabCommon,
					Trapdoor,
				],
				playerTwoDeck: [PoePoeSkizzRare],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 2)
					yield* playCardFromHand(game, Trapdoor, 'attach', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, PoePoeSkizzRare, 'hermit', 0)
					yield* attack(game, 'secondary')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(2),
					)
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(
						EthosLabCommon.health -
							(PoePoeSkizzRare.secondary.damage - 40) /** Trapdoor */,
					)
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(EthosLabCommon.health - 40)
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(2),
						)?.health,
					).toBe(EthosLabCommon.health - 20 /** Jumpscare extra damage */)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Trapdoor does not redirect "Gas Light" bonus damage at end of turn', () => {
		testGame(
			{
				playerOneDeck: [
					...Array(5).fill(EthosLabCommon),
					...Array(3).fill(Trapdoor),
				],
				playerTwoDeck: [SkizzlemanRare, LavaBucket, Anvil],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 2)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 3)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 4)
					yield* playCardFromHand(game, Trapdoor, 'attach', 1)
					yield* playCardFromHand(game, Trapdoor, 'attach', 3)
					yield* playCardFromHand(game, Trapdoor, 'attach', 4)
					yield* endTurn(game)

					yield* playCardFromHand(game, SkizzlemanRare, 'hermit', 2)
					yield* playCardFromHand(game, LavaBucket, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					yield* changeActiveHermit(game, 2)
					yield* endTurn(game)

					yield* playCardFromHand(game, Anvil, 'single_use')
					yield* attack(game, 'secondary')
					yield* endTurn(game)

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(
						EthosLabCommon.health -
							40 /** 2x Burn */ -
							20 /** Gaslight extra damage */,
					)
					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(EthosLabCommon.health)
					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(2),
						)?.health,
					).toBe(
						EthosLabCommon.health -
							(SkizzlemanRare.secondary.damage +
								30 /** Anvil */ -
								40) /** Trapdoor */,
					)
					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(3),
						)?.health,
					).toBe(
						EthosLabCommon.health -
							10 /** Anvil */ -
							20 /** Gaslight extra damage */,
					)
					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(4),
						)?.health,
					).toBe(
						EthosLabCommon.health -
							40 /** Trapdoor (4) -> Trapdoor (5) */ -
							10 /** Anvil */ -
							20 /** Gaslight extra damage */,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Invisibility Tails does not multiply damage intercepted by Trapdoor', () => {
		testGame(
			{
				playerOneDeck: [
					EthosLabCommon,
					EthosLabCommon,
					Trapdoor,
					InvisibilityPotion,
				],
				playerTwoDeck: [EthosLabCommon, BadOmen],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, Trapdoor, 'attach', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, BadOmen, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					yield* playCardFromHand(game, InvisibilityPotion, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(
						EthosLabCommon.health - (EthosLabCommon.secondary.damage * 2 - 40),
					)
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(EthosLabCommon.health - 40)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})
})
