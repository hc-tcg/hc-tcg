import {TypeT} from '../types/cards'
import {
	ChainmailArmor,
	DiamondArmor,
	GoldArmor,
	IronArmor,
	NetheriteArmor,
} from './attach/armor'
import LightningRod from './attach/lightning-rod'
import Loyalty from './attach/loyalty'
import Wolf from './attach/wolf'
import ArchitectFalseCommon from './hermits/architectfalse-common'
import BeetlejhostCommon from './hermits/beetlejhost-common'
import BeetlejhostRare from './hermits/beetlejhost-rare'
import BoomerBdubsCommon from './hermits/boomerbdubs-common'
import Cubfan135Rare from './hermits/cubfan135-rare'
import EthosLabRare from './hermits/ethoslab-rare'
import EthosLabUltraRare from './hermits/ethoslab-ultra-rare'
import EvilJevinRare from './hermits/eviljevin-rare'
import EvilXisumaRare from './hermits/evilxisuma_rare'
import FiveAMPearlCommon from './hermits/fiveampearl-common'
import FrenchralisRare from './hermits/frenchralis-rare'
import GeminiTayRare from './hermits/geminitay-rare'
import GoatfatherRare from './hermits/goatfather-rare'
import HelsknightRare from './hermits/helsknight-rare'
import HotguyCommon from './hermits/hotguy-common'
import HumanCleoRare from './hermits/humancleo-rare'
import ImpulseSVRare from './hermits/impulsesv-rare'
import JinglerRare from './hermits/jingler-rare'
import LlamadadRare from './hermits/llamadad-rare'
import MumboJumboCommon from './hermits/mumbojumbo-common'
import MumboJumboRare from './hermits/mumbojumbo-rare'
import PearlescentMoonRare from './hermits/pearlescentmoon-rare'
import PoePoeSkizzRare from './hermits/poepoeskizz-rare'
import PotatoBoyCommon from './hermits/potatoboy-common'
import SmallishbeansCommon from './hermits/smallishbeans-common'
import SpookyStressCommon from './hermits/spookystress-common'
import SteampunkTangoCommon from './hermits/steampunktango-common'
import StressMonster101Rare from './hermits/stressmonster101-rare'
import TangoTekCommon from './hermits/tangotek-common'
import TangoTekRare from './hermits/tangotek-rare'
import VintageBeefCommon from './hermits/vintagebeef-common'
import WelsknightRare from './hermits/welsknight-rare'
import WormManCommon from './hermits/wormman-common'
import XisumavoidRare from './hermits/xisumavoid-rare'
import ZombieCleoRare from './hermits/zombiecleo-rare'
import BalancedItem from './items/balanced-common'
import BalancedDoubleItem from './items/balanced-rare'
import PranksterItem from './items/prankster-common'
import PvPItem from './items/pvp-common'
import PvPDoubleItem from './items/pvp-rare'
import RedstoneItem from './items/redstone-common'
import SpeedrunnerItem from './items/speedrunner-common'
import SpeedrunnerDoubleItem from './items/speedrunner-rare'
import TerraformItem from './items/terraform-common'
import TerraformDoubleItem from './items/terraform-rare'
import WildItem from './items/wild-common'
import Anvil from './single-use/anvil'
import BadOmen from './single-use/bad-omen'
import Bow from './single-use/bow'
import ChorusFruit from './single-use/chorus-fruit'
import Composter from './single-use/composter'
import CurseOfBinding from './single-use/curse-of-binding'
import CurseOfVanishing from './single-use/curse-of-vanishing'
import Efficiency from './single-use/efficiency'
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
import Piston from './single-use/piston'
import PotionOfWeakness from './single-use/potion-of-weakness'
import SplashPotionOfPoison from './single-use/splash-potion-of-poison'
import {DiamondSword} from './single-use/sword'
import TNT from './single-use/tnt'
import Trident from './single-use/trident'
import {Attach, Hermit, Item, SingleUse} from './types'

export type StarterDeck = {
	name: string
	icon: TypeT
	cards: Array<Hermit | Attach | SingleUse | Item>
}

export const NEW_BOSS_AI_DECKS: Array<StarterDeck> = [
	{
		name: 'Farm Deck #1',
		icon: 'farm',
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
			Composter,
			BadOmen,
			Bow,
			CurseOfVanishing,
			CurseOfVanishing,
			Trident,
			Emerald,
			FishingRod,
			FishingRod,
			GoldenAxe,
			InstantHealthII,
			TNT,
			Trident,
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
		icon: 'pvp',
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
		icon: 'balanced',
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
			SplashPotionOfPoison,
			SplashPotionOfPoison,
			DiamondSword,
			DiamondSword,
			Fortune,
			Fortune,
			Fortune,
			TNT,
			TNT,
			Trident,
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
		icon: 'speedrunner',
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
			Wolf,
			Wolf,
			SpeedrunnerDoubleItem,
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
			GoldenApple,
			GoldenApple,
			Trident,
			TNT,
			NetheriteArmor,
			NetheriteArmor,
			FishingRod,
			FishingRod,
			FishingRod,
			CurseOfBinding,
			CurseOfBinding,
			InstantHealthII,
			InstantHealthII,
		],
	},
	{
		name: 'Redstone Deck #1',
		icon: 'redstone',
		cards: [
			EthosLabRare,
			EthosLabRare,
			XisumavoidRare,
			XisumavoidRare,
			MumboJumboCommon,
			MumboJumboCommon,
			TangoTekCommon,
			TangoTekCommon,
			ImpulseSVRare,
			ImpulseSVRare,
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
			Trident,
			Trident,
			Composter,
			Composter,
			IronArmor,
			DiamondArmor,
			TNT,
			TNT,
		],
	},
	{
		name: 'PvP Deck #2',
		icon: 'pvp',
		cards: [
			WelsknightRare,
			WelsknightRare,
			WelsknightRare,
			FiveAMPearlCommon,
			FiveAMPearlCommon,
			HumanCleoRare,
			HumanCleoRare,
			FishingRod,
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
		icon: 'prankster',
		cards: [
			MumboJumboRare,
			MumboJumboRare,
			MumboJumboRare,
			StressMonster101Rare,
			StressMonster101Rare,
			BoomerBdubsCommon,
			BoomerBdubsCommon,
			BoomerBdubsCommon,
			Trident,
			Trident,
			GoldArmor,
			GoldArmor,
			GoldArmor,
			FishingRod,
			FishingRod,
			Composter,
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
			PranksterItem,
			InstantHealthII,
			InstantHealthII,
			InstantHealthII,
			PotionOfWeakness,
			PotionOfWeakness,
			PotionOfWeakness,
			Knockback,
			Knockback,
		],
	},
	{
		name: 'Prankster Deck #2',
		icon: 'prankster',
		cards: [
			GoldenAxe,
			GoldenAxe,
			InstantHealthII,
			InstantHealthII,
			InstantHealthII,
			FishingRod,
			FishingRod,
			Composter,
			Composter,
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
		icon: 'pvp',
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
			Trident,
			Trident,
			FishingRod,
			FishingRod,
			Composter,
			InvisibilityPotion,
			InvisibilityPotion,
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
	// Feel free to add more decks here!
	// Cards which don't work and should not be included: -target block, -turtle shell, -piston, -clock, -bow, -chorus fruit, -chest, -knockback, -curse of vanishing,
]

export function getStarterPack(): StarterDeck {
	return NEW_BOSS_AI_DECKS[Math.floor(Math.random() * NEW_BOSS_AI_DECKS.length)]
}
