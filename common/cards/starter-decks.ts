// import WildDoubleItem from './advent-of-tcg/items/wild-rare'
// import {DiamondArmor} from './attach/armor'
// import ChainmailArmor from './attach/chainmail-armor'
// import LightningRod from './attach/lightning-rod'
// import Loyalty from './attach/loyalty'
// import BeetlejhostRare from './hermits/beetlejhost-rare'
// import EvilXisumaRare from './hermits/evilxisuma_rare'
// import FiveAMPearlCommon from './hermits/fiveampearl-common'
// import GeminiTayRare from './hermits/geminitay-rare'
// import LlamadadRare from './hermits/llamadad-rare'
// import PearlescentMoonRare from './hermits/pearlescentmoon-rare'
// import PoePoeSkizzRare from './hermits/poepoeskizz-rare'
// import PotatoBoyCommon from './hermits/potatoboy-common'
// import SmallishbeansCommon from './hermits/smallishbeans-common'
// import SpookyStressCommon from './hermits/spookystress-common'
// import TangoTekRare from './hermits/tangotek-rare'
// import VintageBeefCommon from './hermits/vintagebeef-common'
// import WelsknightRare from './hermits/welsknight-rare'
// import WormManCommon from './hermits/wormman-common'
// import ZombieCleoRare from './hermits/zombiecleo-rare'
// import BalancedItem from './items/balanced-common'
// import BalancedDoubleItem from './items/balanced-rare'
// import PvPItem from './items/pvp-common'
// import PvPDoubleItem from './items/pvp-rare'
// import TerraformItem from './items/terraform-common'
// import TerraformDoubleItem from './items/terraform-rare'
// import WildItem from './items/wild-common'
// import BadOmen from './single-use/bad-omen'
// import Bow from './single-use/bow'
// import Chest from './single-use/chest'
// import Clock from './single-use/clock'
// import Composter from './single-use/composter'
// import CurseOfVanishing from './single-use/curse-of-vanishing'
// import Efficiency from './single-use/efficiency'
// import Emerald from './single-use/emerald'
// import FishingRod from './single-use/fishing-rod'
// import FlintAndSteel from './single-use/flint-and-steel'
// import Fortune from './single-use/fortune'
// import GoldenAxe from './single-use/golden-axe'
// import {InstantHealth, InstantHealthII} from './single-use/instant-health'
// import InvisibilityPotion from './single-use/invisibility-potion'
// import Knockback from './single-use/knockback'
// import Ladder from './single-use/ladder'
// import Piston from './single-use/piston'
// import {DiamondSword} from './single-use/sword'
// import TargetBlock from './single-use/target-block'
// import TNT from './single-use/tnt'
import {Card} from './types'

export const STARTER_DECKS = [
	[
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
		Chest,
		Emerald,
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
		WildDoubleItem,
		WildDoubleItem,
		WildDoubleItem,
	],
	[
		SmallishbeansCommon,
		SmallishbeansCommon,
		FiveAMPearlCommon,
		SpookyStressCommon,
		SpookyStressCommon,
		PoePoeSkizzRare,
		WelsknightRare,
		WelsknightRare,
		WelsknightRare,
		ZombieCleoRare,
		ZombieCleoRare,
		Loyalty,
		Loyalty,
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
		PvPItem,
		PvPDoubleItem,
		PvPDoubleItem,
		PvPDoubleItem,
		PvPDoubleItem,
		PvPDoubleItem,
		PvPDoubleItem,
		WildItem,
	],
	[
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
]

export function getStarterPack(): Array<Card> {
	return STARTER_DECKS[Math.random() * STARTER_DECKS.length]
}
