import {
	ChainmailArmor,
	DiamondArmor,
	GoldArmor,
	IronArmor,
	NetheriteArmor,
} from './attach/armor'
import LightningRod from './attach/lightning-rod'
import Loyalty from './attach/loyalty'
import TurtleShell from './attach/turtle-shell'
import Wolf from './attach/wolf'
import ArchitectFalseCommon from './hermits/architectfalse-common'
import BdoubleO100Common from './hermits/bdoubleo100-common'
import BeetlejhostCommon from './hermits/beetlejhost-common'
import BeetlejhostRare from './hermits/beetlejhost-rare'
import BoomerBdubsCommon from './hermits/boomerbdubs-common'
import Cubfan135Rare from './hermits/cubfan135-rare'
import EthosLabCommon from './hermits/ethoslab-common'
import EthosLabRare from './hermits/ethoslab-rare'
import EthosLabUltraRare from './hermits/ethoslab-ultra-rare'
import EvilJevinRare from './hermits/eviljevin-rare'
import EvilXisumaRare from './hermits/evilxisuma_rare'
import FiveAMPearlCommon from './hermits/fiveampearl-common'
import FiveAMPearlRare from './hermits/fiveampearl-rare'
import FrenchralisRare from './hermits/frenchralis-rare'
import GeminiTayRare from './hermits/geminitay-rare'
import GoatfatherRare from './hermits/goatfather-rare'
import GrianCommon from './hermits/grian-common'
import HelsknightRare from './hermits/helsknight-rare'
import HotguyCommon from './hermits/hotguy-common'
import HumanCleoCommon from './hermits/humancleo-common'
import ImpulseSVRare from './hermits/impulsesv-rare'
import JinglerRare from './hermits/jingler-rare'
import LlamadadRare from './hermits/llamadad-rare'
import MumboJumboCommon from './hermits/mumbojumbo-common'
import MumboJumboRare from './hermits/mumbojumbo-rare'
import PearlescentMoonRare from './hermits/pearlescentmoon-rare'
import PoePoeSkizzRare from './hermits/poepoeskizz-rare'
import PotatoBoyCommon from './hermits/potatoboy-common'
import PoultrymanCommon from './hermits/poultryman-common'
import SmallishbeansCommon from './hermits/smallishbeans-common'
import SpookyStressCommon from './hermits/spookystress-common'
import SteampunkTangoCommon from './hermits/steampunktango-common'
import StressMonster101Rare from './hermits/stressmonster101-rare'
import TangoTekCommon from './hermits/tangotek-common'
import TangoTekRare from './hermits/tangotek-rare'
import VintageBeefCommon from './hermits/vintagebeef-common'
import VintageBeefRare from './hermits/vintagebeef-rare'
import WelsknightCommon from './hermits/welsknight-common'
import WelsknightRare from './hermits/welsknight-rare'
import WormManCommon from './hermits/wormman-common'
import XisumavoidRare from './hermits/xisumavoid-rare'
import ZombieCleoCommon from './hermits/zombiecleo-common'
import ZombieCleoRare from './hermits/zombiecleo-rare'
import BalancedItem from './items/balanced-common'
import BalancedDoubleItem from './items/balanced-rare'
import BuilderItem from './items/builder-common'
import PranksterItem from './items/prankster-common'
import PvPItem from './items/pvp-common'
import PvPDoubleItem from './items/pvp-rare'
import RedstoneItem from './items/redstone-common'
import RedstoneDoubleItem from './items/redstone-rare'
import SpeedrunnerItem from './items/speedrunner-common'
import SpeedrunnerDoubleItem from './items/speedrunner-rare'
import TerraformItem from './items/terraform-common'
import TerraformDoubleItem from './items/terraform-rare'
import WildItem from './items/wild-common'
import Anvil from './single-use/anvil'
import BadOmen from './single-use/bad-omen'
import Bow from './single-use/bow'
import Chest from './single-use/chest'
import ChorusFruit from './single-use/chorus-fruit'
import Clock from './single-use/clock'
import Composter from './single-use/composter'
import Crossbow from './single-use/crossbow'
import CurseOfBinding from './single-use/curse-of-binding'
import CurseOfVanishing from './single-use/curse-of-vanishing'
import Efficiency from './single-use/efficiency'
import Egg from './single-use/egg'
import Emerald from './single-use/emerald'
import FishingRod from './single-use/fishing-rod'
import FlintAndSteel from './single-use/flint-and-steel'
import Fortune from './single-use/fortune'
import GoldenApple from './single-use/golden-apple'
import GoldenAxe from './single-use/golden-axe'
import {InstantHealth, InstantHealthII} from './single-use/instant-health'
import InvisibilityPotion from './single-use/invisibility-potion'
import Knockback from './single-use/knockback'
import Ladder from './single-use/ladder'
import LavaBucket from './single-use/lava-bucket'
import Mending from './single-use/mending'
import Piston from './single-use/piston'
import PotionOfWeakness from './single-use/potion-of-weakness'
import SplashPotionOfPoison from './single-use/splash-potion-of-poison'
import {DiamondSword} from './single-use/sword'
import TargetBlock from './single-use/target-block'
import TNT from './single-use/tnt'
import {Attach, Card, Hermit, Item, SingleUse} from './types'

export type StarterDeck = {
	name: string
	cards: Array<Hermit | Attach | SingleUse | Item>
}

export const STARTER_DECKS: Array<StarterDeck> = [
	{
		name: 'Farm Deck #1',
		cards: [
			PotatoBoyCommon,
			PotatoBoyCommon,
			WormManCommon,
			WormManCommon,
			GeminiTayRare,
			GeminiTayRare,
			TangoTekRare,
			TangoTekRare,
			PearlescentMoonRare,
			PearlescentMoonRare,
			Loyalty,
			ChainmailArmor,
			DiamondArmor,
			Composter,
			BadOmen,
			Bow,
			CurseOfVanishing,
			Chest,
			Emerald,
			FishingRod,
			FishingRod,
			FishingRod,
			GoldenAxe,
			InstantHealthII,
			TargetBlock,
			Clock,
			TerraformItem,
			TerraformItem,
			TerraformItem,
			TerraformItem,
			TerraformItem,
			TerraformItem,
			TerraformItem,
			TerraformItem,
			TerraformItem,
			TerraformItem,
			TerraformItem,
			TerraformDoubleItem,
			TerraformDoubleItem,
			WildItem,
			WildItem,
			WildItem,
		],
	},
	{
		name: 'PvP Deck #1',
		cards: [
			SmallishbeansCommon,
			SmallishbeansCommon,
			FiveAMPearlCommon,
			SpookyStressCommon,
			PoePoeSkizzRare,
			WelsknightRare,
			WelsknightRare,
			WelsknightRare,
			ZombieCleoRare,
			ZombieCleoRare,
			Loyalty,
			Efficiency,
			ChainmailArmor,
			ChainmailArmor,
			LightningRod,
			InstantHealth,
			InvisibilityPotion,
			Piston,
			CurseOfVanishing,
			Efficiency,
			FlintAndSteel,
			Emerald,
			FishingRod,
			FishingRod,
			InstantHealthII,
			Ladder,
			PvPItem,
			PvPItem,
			PvPItem,
			PvPItem,
			PvPItem,
			PvPItem,
			PvPDoubleItem,
			PvPDoubleItem,
			PvPDoubleItem,
			PvPDoubleItem,
			PvPDoubleItem,
			PvPDoubleItem,
			PvPDoubleItem,
			WildItem,
			WildItem,
			WildItem,
		],
	},
	{
		name: 'Balanced Deck #1',
		cards: [
			VintageBeefCommon,
			VintageBeefCommon,
			BeetlejhostRare,
			BeetlejhostRare,
			LlamadadRare,
			LlamadadRare,
			LlamadadRare,
			EvilXisumaRare,
			EvilXisumaRare,
			DiamondArmor,
			DiamondArmor,
			DiamondArmor,
			Composter,
			Composter,
			InstantHealth,
			Knockback,
			Knockback,
			DiamondSword,
			Fortune,
			Fortune,
			Fortune,
			TNT,
			TNT,
			TNT,
			TargetBlock,
			BalancedItem,
			BalancedItem,
			BalancedItem,
			BalancedItem,
			BalancedItem,
			BalancedItem,
			BalancedItem,
			BalancedItem,
			BalancedItem,
			BalancedItem,
			BalancedItem,
			BalancedItem,
			BalancedItem,
			BalancedItem,
			BalancedDoubleItem,
			BalancedDoubleItem,
			BalancedDoubleItem,
		],
	},
	{
		name: 'Spedrunner Deck #1',
		cards: [
			SteampunkTangoCommon,
			SteampunkTangoCommon,
			ArchitectFalseCommon,
			HotguyCommon,
			EvilJevinRare,
			EvilJevinRare,
			Cubfan135Rare,
			Cubfan135Rare,
			JinglerRare,
			BeetlejhostCommon,
			TurtleShell,
			TurtleShell,
			SpeedrunnerDoubleItem,
			SpeedrunnerDoubleItem,
			SpeedrunnerDoubleItem,
			SpeedrunnerItem,
			SpeedrunnerItem,
			SpeedrunnerItem,
			SpeedrunnerItem,
			SpeedrunnerItem,
			SpeedrunnerItem,
			SpeedrunnerItem,
			SpeedrunnerItem,
			SpeedrunnerItem,
			SpeedrunnerItem,
			SpeedrunnerItem,
			SpeedrunnerItem,
			SpeedrunnerItem,
			SpeedrunnerItem,
			GoldenApple,
			ChorusFruit,
			ChorusFruit,
			NetheriteArmor,
			NetheriteArmor,
			FishingRod,
			FishingRod,
			FishingRod,
			CurseOfVanishing,
			InstantHealthII,
			InstantHealthII,
			GoldenApple,
			CurseOfVanishing,
		],
	},
	{
		name: 'Redstone Deck #1',
		cards: [
			EthosLabRare,
			XisumavoidRare,
			MumboJumboCommon,
			MumboJumboCommon,
			ImpulseSVRare,
			TangoTekCommon,
			TangoTekCommon,
			EthosLabRare,
			ImpulseSVRare,
			XisumavoidRare,
			FishingRod,
			FishingRod,
			LavaBucket,
			Anvil,
			Anvil,
			Anvil,
			RedstoneItem,
			RedstoneItem,
			RedstoneItem,
			RedstoneItem,
			RedstoneItem,
			RedstoneItem,
			RedstoneItem,
			RedstoneItem,
			RedstoneItem,
			RedstoneItem,
			RedstoneItem,
			RedstoneItem,
			RedstoneItem,
			RedstoneItem,
			RedstoneItem,
			RedstoneItem,
			RedstoneItem,
			RedstoneItem,
			Chest,
			Chest,
			Composter,
			Composter,
			DiamondArmor,
			DiamondArmor,
			Clock,
			TargetBlock,
		],
	},
	{
		name: 'PvP Deck #2',
		cards: [
			WelsknightRare,
			WelsknightRare,
			WelsknightRare,
			FiveAMPearlCommon,
			FiveAMPearlCommon,
			HumanCleoCommon,
			HumanCleoCommon,
			FishingRod,
			FishingRod,
			Fortune,
			Fortune,
			DiamondSword,
			DiamondSword,
			EthosLabUltraRare,
			EthosLabUltraRare,
			PvPDoubleItem,
			PvPDoubleItem,
			PvPDoubleItem,
			PvPDoubleItem,
			PvPItem,
			PvPItem,
			PvPItem,
			PvPItem,
			PvPItem,
			PvPItem,
			PvPItem,
			PvPItem,
			PvPItem,
			PvPItem,
			PvPItem,
			PvPItem,
			PvPDoubleItem,
			IronArmor,
			IronArmor,
			SplashPotionOfPoison,
			SplashPotionOfPoison,
			CurseOfVanishing,
			CurseOfVanishing,
			InstantHealth,
			InstantHealth,
			Composter,
			Composter,
		],
	},
	{
		name: 'Prankster Deck #1',
		cards: [
			MumboJumboRare,
			MumboJumboRare,
			PoultrymanCommon,
			StressMonster101Rare,
			StressMonster101Rare,
			BoomerBdubsCommon,
			BoomerBdubsCommon,
			BoomerBdubsCommon,
			TargetBlock,
			TargetBlock,
			GoldArmor,
			GoldArmor,
			GoldArmor,
			FishingRod,
			FishingRod,
			FishingRod,
			Composter,
			Composter,
			WildItem,
			WildItem,
			WildItem,
			PranksterItem,
			PranksterItem,
			PranksterItem,
			PranksterItem,
			PranksterItem,
			PranksterItem,
			PranksterItem,
			PranksterItem,
			PranksterItem,
			PranksterItem,
			PranksterItem,
			PranksterItem,
			InstantHealthII,
			InstantHealthII,
			InstantHealthII,
			PotionOfWeakness,
			PotionOfWeakness,
			PotionOfWeakness,
			Egg,
			PranksterItem,
			TargetBlock,
		],
	},
	{
		name: 'Builder Deck #1',
		cards: [
			EthosLabCommon,
			EthosLabCommon,
			BeetlejhostRare,
			FiveAMPearlRare,
			LlamadadRare,
			FiveAMPearlRare,
			ZombieCleoCommon,
			ZombieCleoCommon,
			WelsknightCommon,
			VintageBeefRare,
			WildItem,
			WildItem,
			WildItem,
			BalancedDoubleItem,
			BalancedItem,
			BalancedItem,
			BalancedItem,
			BalancedItem,
			BalancedItem,
			BalancedItem,
			BuilderItem,
			BuilderItem,
			BuilderItem,
			BuilderItem,
			BuilderItem,
			Clock,
			InstantHealthII,
			InstantHealthII,
			FishingRod,
			Wolf,
			Wolf,
			Wolf,
			TurtleShell,
			Emerald,
			TNT,
			TNT,
			NetheriteArmor,
			Mending,
			LavaBucket,
			BuilderItem,
			Crossbow,
			LavaBucket,
		],
	},
	{
		name: 'Redstone/Builder #1',
		cards: [
			TurtleShell,
			BdoubleO100Common,
			ImpulseSVRare,
			TangoTekCommon,
			ImpulseSVRare,
			TurtleShell,
			BdoubleO100Common,
			Ladder,
			ImpulseSVRare,
			RedstoneItem,
			FishingRod,
			Ladder,
			BuilderItem,
			TangoTekCommon,
			Clock,
			BuilderItem,
			BuilderItem,
			RedstoneDoubleItem,
			BdoubleO100Common,
			RedstoneItem,
			Clock,
			RedstoneItem,
			Clock,
			Ladder,
			RedstoneItem,
			RedstoneItem,
			FishingRod,
			BuilderItem,
			BuilderItem,
			FishingRod,
			RedstoneItem,
			TangoTekCommon,
			TurtleShell,
			RedstoneItem,
			RedstoneItem,
			GrianCommon,
			GrianCommon,
			GrianCommon,
			WildItem,
			WildItem,
			WildItem,
			ChorusFruit,
		],
	},
	{
		name: 'Prankster Deck #2',
		cards: [
			GoldenAxe,
			GoldenAxe,
			InstantHealthII,
			InstantHealthII,
			InstantHealthII,
			FishingRod,
			FishingRod,
			Composter,
			Chest,
			Chest,
			MumboJumboRare,
			MumboJumboRare,
			MumboJumboRare,
			FrenchralisRare,
			FrenchralisRare,
			BoomerBdubsCommon,
			BoomerBdubsCommon,
			GoatfatherRare,
			ChorusFruit,
			ChorusFruit,
			ChorusFruit,
			PranksterItem,
			PranksterItem,
			PranksterItem,
			PranksterItem,
			PranksterItem,
			PranksterItem,
			PranksterItem,
			PranksterItem,
			PranksterItem,
			PranksterItem,
			PranksterItem,
			PranksterItem,
			PranksterItem,
			PranksterItem,
			PranksterItem,
			PranksterItem,
			PranksterItem,
			PranksterItem,
			BoomerBdubsCommon,
			PranksterItem,
			DiamondSword,
		],
	},
	{
		name: 'PvP Deck #3',
		cards: [
			ZombieCleoRare,
			ZombieCleoRare,
			WelsknightRare,
			WelsknightRare,
			WelsknightRare,
			PvPItem,
			PvPItem,
			PvPItem,
			PvPItem,
			PvPItem,
			PvPItem,
			PvPItem,
			PvPItem,
			PvPItem,
			PvPItem,
			PvPItem,
			PvPItem,
			PvPItem,
			TargetBlock,
			TargetBlock,
			FishingRod,
			FishingRod,
			InvisibilityPotion,
			InvisibilityPotion,
			FishingRod,
			InvisibilityPotion,
			TNT,
			TNT,
			HelsknightRare,
			HelsknightRare,
			HelsknightRare,
			PvPItem,
			PvPItem,
			SmallishbeansCommon,
			SmallishbeansCommon,
			PvPDoubleItem,
			PvPDoubleItem,
			PvPDoubleItem,
			PvPDoubleItem,
			PvPDoubleItem,
			CurseOfBinding,
			CurseOfBinding,
		],
	},
]

export function getStarterPack(): Array<Card> {
	return STARTER_DECKS[Math.floor(Math.random() * STARTER_DECKS.length)].cards
}
