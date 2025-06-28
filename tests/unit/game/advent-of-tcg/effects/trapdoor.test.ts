import {describe, expect, test} from '@jest/globals'
import Trapdoor from 'common/cards/advent-of-tcg/attach/trapdoor'
import SplashPotionOfHarming from 'common/cards/advent-of-tcg/single-use/splash-potion-of-harming'
import {IronArmor} from 'common/cards/attach/armor'
import LightningRod from 'common/cards/attach/lightning-rod'
import {Thorns} from 'common/cards/attach/thorns'
import WaterBucket from 'common/cards/attach/water-bucket'
import Wolf from 'common/cards/attach/wolf'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import FarmerBeefCommon from 'common/cards/hermits/farmerbeef-common'
import GoatfatherRare from 'common/cards/hermits/goatfather-rare'
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
import {testGame} from '../../utils'

describe('Test Trapdoor', () => {
	test('Trapdoor functionality', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, Trapdoor],
				playerTwoDeck: [FarmerBeefCommon, NetheriteSword],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(Trapdoor, 'attach', 1)
					await test.endTurn()

					await test.playCardFromHand(FarmerBeefCommon, 'hermit', 0)
					await test.attack('secondary')
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(
						EthosLabCommon.health - (FarmerBeefCommon.secondary.damage - 40),
					)
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(EthosLabCommon.health - 40)
					await test.endTurn()

					await test.endTurn()

					await test.playCardFromHand(NetheriteSword, 'single_use')
					await test.attack('single-use')
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(
						EthosLabCommon.health -
							(FarmerBeefCommon.secondary.damage - 40) -
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

	test('Anvil attacks rows in order', async () => {
		await testGame(
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
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 2)
					await test.playCardFromHand(IronArmor, 'attach', 2)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(EnderPearl, 'single_use')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 2)
					await test.playCardFromHand(Trapdoor, 'attach', 1)
					await test.endTurn()

					await test.playCardFromHand(VintageBeefCommon, 'hermit', 0)
					await test.playCardFromHand(Anvil, 'single_use')
					expect(Anvil.attackPreview?.(game)).toBe('$A30$ + $A10$ x 2')
					await test.attack('primary')
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

	test('Spooky Stress attacks rows in order', async () => {
		await testGame(
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
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 3)
					await test.playCardFromHand(IronArmor, 'attach', 3)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(EnderPearl, 'single_use')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 2)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 3)
					await test.playCardFromHand(Trapdoor, 'attach', 3)
					await test.endTurn()

					await test.playCardFromHand(SpookyStressRare, 'hermit', 3)
					await test.playCardFromHand(WaterBucket, 'attach', 3)
					await test.playCardFromHand(Anvil, 'single_use')
					expect(Anvil.attackPreview?.(game)).toBe('$A30$')
					await test.attack('secondary')
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

	test('Anvil Drop attacks rows in order', async () => {
		await testGame(
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
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 3)
					await test.playCardFromHand(IronArmor, 'attach', 3)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 2)
					await test.playCardFromHand(EnderPearl, 'single_use')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 3)
					await test.playCardFromHand(Trapdoor, 'attach', 2)
					await test.endTurn()

					await test.playCardFromHand(GoatfatherRare, 'hermit', 3)
					await test.playCardFromHand(Anvil, 'single_use')
					expect(Anvil.attackPreview?.(game)).toBe('$A30$')
					await test.attack('secondary')
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

	test('Splash Harming attacks rows in order', async () => {
		await testGame(
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
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 2)
					await test.playCardFromHand(IronArmor, 'attach', 2)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(EnderPearl, 'single_use')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 2)
					await test.playCardFromHand(Trapdoor, 'attach', 1)
					await test.endTurn()

					await test.playCardFromHand(VintageBeefCommon, 'hermit', 1)
					await test.playCardFromHand(SplashPotionOfHarming, 'single_use')
					expect(SplashPotionOfHarming.attackPreview?.(game)).toBe(
						'$A40$ + $A20$ x 2',
					)
					await test.attack('primary')
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

	test('Trapdoor priority vs Lightning Rod/Target Block', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, Trapdoor, LightningRod],
				playerTwoDeck: [FarmerBeefCommon, TargetBlock],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(Trapdoor, 'attach', 1)
					await test.playCardFromHand(LightningRod, 'attach', 0)
					await test.endTurn()

					await test.playCardFromHand(FarmerBeefCommon, 'hermit', 0)
					await test.attack('primary')
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(EthosLabCommon.health - (FarmerBeefCommon.primary.damage - 40))
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(EthosLabCommon.health - 40)
					await test.endTurn()

					await test.endTurn()

					await test.playCardFromHand(TargetBlock, 'single_use')
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					await test.attack('primary')
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
							(FarmerBeefCommon.primary.damage - 40) -
							FarmerBeefCommon.primary.damage,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Multiple Trapdoors at once', async () => {
		await testGame(
			{
				playerOneDeck: [
					...Array(4).fill(EthosLabCommon),
					...Array(3).fill(Trapdoor),
				],
				playerTwoDeck: [VintageBeefCommon],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 2)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 3)
					await test.playCardFromHand(Trapdoor, 'attach', 0)
					await test.playCardFromHand(Trapdoor, 'attach', 2)
					await test.playCardFromHand(Trapdoor, 'attach', 3)
					await test.endTurn()

					await test.playCardFromHand(VintageBeefCommon, 'hermit', 0)
					await test.attack('secondary')
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

	test('Wolf triggers when Trapdoor redirects all damage', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, Wolf, Trapdoor],
				playerTwoDeck: [VintageBeefCommon],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(Wolf, 'attach', 0)
					await test.playCardFromHand(Trapdoor, 'attach', 1)
					await test.endTurn()

					await test.playCardFromHand(VintageBeefCommon, 'hermit', 0)
					await test.attack('primary')
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

	test('Thorns does not trigger when Trapdoor redirects all damage', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, Thorns, Trapdoor],
				playerTwoDeck: [VintageBeefCommon],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(Thorns, 'attach', 0)
					await test.playCardFromHand(Trapdoor, 'attach', 1)
					await test.endTurn()

					await test.playCardFromHand(VintageBeefCommon, 'hermit', 0)
					await test.attack('primary')
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

	test('Thorns triggers from Weakness damage when Trapdoor + Royal Protection blocks hermit damage', async () => {
		await testGame(
			{
				playerOneDeck: [VintageBeefCommon, PotionOfWeakness],
				playerTwoDeck: [PrincessGemRare, EthosLabCommon, Wolf, Trapdoor],
				testGame: async (test, game) => {
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(PrincessGemRare, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(Wolf, 'attach', 0)
					await test.playCardFromHand(Trapdoor, 'attach', 1)
					await test.attack('secondary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.endTurn()

					await test.playCardFromHand(PotionOfWeakness, 'single_use')
					await test.applyEffect()
					await test.attack('primary')
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

	test('Thorns triggers from Weakness damage when Trapdoor + Royal Protection blocks hermit damage', async () => {
		await testGame(
			{
				playerOneDeck: [VintageBeefCommon, PotionOfWeakness],
				playerTwoDeck: [PrincessGemRare, EthosLabCommon, Thorns, Trapdoor],
				testGame: async (test, game) => {
					await test.playCardFromHand(VintageBeefCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(PrincessGemRare, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(Thorns, 'attach', 0)
					await test.playCardFromHand(Trapdoor, 'attach', 1)
					await test.attack('secondary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.endTurn()

					await test.playCardFromHand(PotionOfWeakness, 'single_use')
					await test.applyEffect()
					await test.attack('primary')
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

	test('Trapdoor does not redirect when Renbob "Hyperspace" attacks an empty row', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, Trapdoor],
				playerTwoDeck: [RenbobRare],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(Trapdoor, 'attach', 1)
					await test.endTurn()

					await test.playCardFromHand(RenbobRare, 'hermit', 0)
					await test.attack('secondary')
					await test.endTurn()

					expect(game.currentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Trapdoor only redirects 40hp of Poe Poe Skizz "Jumpscare"', async () => {
		await testGame(
			{
				playerOneDeck: [
					EthosLabCommon,
					EthosLabCommon,
					EthosLabCommon,
					Trapdoor,
				],
				playerTwoDeck: [PoePoeSkizzRare],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 2)
					await test.playCardFromHand(Trapdoor, 'attach', 1)
					await test.endTurn()

					await test.playCardFromHand(PoePoeSkizzRare, 'hermit', 0)
					await test.attack('secondary')
					await test.pick(
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

	test('Trapdoor does not redirect "Gas Light" bonus damage at end of turn', async () => {
		await testGame(
			{
				playerOneDeck: [
					...Array(5).fill(EthosLabCommon),
					...Array(3).fill(Trapdoor),
				],
				playerTwoDeck: [SkizzlemanRare, LavaBucket, Anvil],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 2)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 3)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 4)
					await test.playCardFromHand(Trapdoor, 'attach', 1)
					await test.playCardFromHand(Trapdoor, 'attach', 3)
					await test.playCardFromHand(Trapdoor, 'attach', 4)
					await test.endTurn()

					await test.playCardFromHand(SkizzlemanRare, 'hermit', 2)
					await test.playCardFromHand(LavaBucket, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.changeActiveHermit(2)
					await test.endTurn()

					await test.playCardFromHand(Anvil, 'single_use')
					await test.attack('secondary')
					await test.endTurn()

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

	test('Invisibility Tails does not multiply damage intercepted by Trapdoor', async () => {
		await testGame(
			{
				playerOneDeck: [
					EthosLabCommon,
					EthosLabCommon,
					Trapdoor,
					InvisibilityPotion,
				],
				playerTwoDeck: [EthosLabCommon, BadOmen],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(Trapdoor, 'attach', 1)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(BadOmen, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.playCardFromHand(InvisibilityPotion, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					await test.attack('secondary')
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
