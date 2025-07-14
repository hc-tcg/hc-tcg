import PharaohRare from './advent-of-tcg/hermits/pharaoh-rare'
import {DiamondArmor, NetheriteArmor} from './attach/armor'
import ArmorStand from './attach/armor-stand'
import CommandBlock from './attach/command-block'
import TurtleShell from './attach/turtle-shell'
import Cubfan135Common from './hermits/cubfan135-common'
import Cubfan135Rare from './hermits/cubfan135-rare'
import JinglerRare from './hermits/jingler-rare'
import BalancedItem from './items/balanced-common'
import BalancedDoubleItem from './items/balanced-rare'
import SpeedrunnerItem from './items/speedrunner-common'
import SpeedrunnerDoubleItem from './items/speedrunner-rare'
import Bow from './single-use/bow'
import Chest from './single-use/chest'
import ChorusFruit from './single-use/chorus-fruit'
import Clock from './single-use/clock'
import CurseOfVanishing from './single-use/curse-of-vanishing'
import Egg from './single-use/egg'
import Emerald from './single-use/emerald'
import FishingRod from './single-use/fishing-rod'
import FlintAndSteel from './single-use/flint-and-steel'
import GoldenApple from './single-use/golden-apple'
import {InstantHealthII} from './single-use/instant-health'
import LavaBucket from './single-use/lava-bucket'
import Piston from './single-use/piston'
import PotionOfWeakness from './single-use/potion-of-weakness'
import SplashPotionOfPoison from './single-use/splash-potion-of-poison'
import {DiamondSword} from './single-use/sword'
import TargetBlock from './single-use/target-block'
import TNT from './single-use/tnt'
import {StarterDeck} from './starter-decks'

export const PHARAOH_BOSS_DECKS: Array<StarterDeck> = [
	{
		name: 'Season 9 Download',
		icon: 'speedrunner',
		cards: [
			Cubfan135Common,
			Cubfan135Common,
			Cubfan135Rare,
			Cubfan135Rare,
			JinglerRare,
			JinglerRare,
			PharaohRare,
			PharaohRare,
			PharaohRare,
			Bow,
			Chest,
			Clock,
			DiamondSword,
			Emerald,
			Emerald,
			FlintAndSteel,
			FlintAndSteel,
			LavaBucket,
			NetheriteArmor,
			TNT,
			CommandBlock,
			TurtleShell,
			Egg,
			PotionOfWeakness,
			TargetBlock,
			...Array(6).fill(BalancedItem),
			BalancedDoubleItem,
			BalancedDoubleItem,
			...Array(7).fill(SpeedrunnerItem),
			SpeedrunnerDoubleItem,
			SpeedrunnerDoubleItem,
		],
	},
	{
		name: 'Pre-Alter Egos', // https://youtu.be/8nfh2qlWnpg
		icon: 'balanced',
		cards: [
			PharaohRare,
			PharaohRare,
			PharaohRare,
			DiamondArmor,
			DiamondArmor,
			...Array(10).fill(BalancedItem),
			FlintAndSteel,
			CurseOfVanishing,
			CurseOfVanishing,
			LavaBucket,
			Cubfan135Rare,
			Cubfan135Rare,
			Cubfan135Rare,
			Cubfan135Common,
			Cubfan135Common,
			Cubfan135Common,
			ChorusFruit,
			SpeedrunnerDoubleItem,
			NetheriteArmor,
			GoldenApple,
			Clock,
			...Array(7).fill(SpeedrunnerItem),
			TNT,
			TNT,
			InstantHealthII,
			SplashPotionOfPoison,
			Bow,
		],
	},
	{
		name: 'vs. GTWScar 3', // https://youtu.be/0kBHC4oqSgA
		icon: 'balanced',
		cards: [
			NetheriteArmor,
			ArmorStand,
			Clock,
			...Array(7).fill(SpeedrunnerItem),
			...Array(10).fill(BalancedItem),
			SpeedrunnerDoubleItem,
			InstantHealthII,
			DiamondArmor,
			LavaBucket,
			SplashPotionOfPoison,
			Cubfan135Rare,
			Cubfan135Rare,
			PharaohRare,
			PharaohRare,
			PharaohRare,
			JinglerRare,
			TurtleShell,
			FlintAndSteel,
			ChorusFruit,
			CurseOfVanishing,
			Bow,
			TNT,
			TNT,
			PotionOfWeakness,
			Cubfan135Common,
			Cubfan135Common,
			Cubfan135Common,
		],
	},
	{
		name: 'vs. Jevin 2', // https://youtu.be/J7rUGU-jpEc
		icon: 'balanced',
		cards: [
			NetheriteArmor,
			ArmorStand,
			Clock,
			...Array(7).fill(SpeedrunnerItem),
			...Array(10).fill(BalancedItem),
			SpeedrunnerDoubleItem,
			InstantHealthII,
			DiamondArmor,
			LavaBucket,
			SplashPotionOfPoison,
			Cubfan135Rare,
			PharaohRare,
			PharaohRare,
			PharaohRare,
			JinglerRare,
			JinglerRare,
			TurtleShell,
			FlintAndSteel,
			ChorusFruit,
			CurseOfVanishing,
			Bow,
			TNT,
			TNT,
			PotionOfWeakness,
			Cubfan135Common,
			Cubfan135Common,
			Cubfan135Common,
		],
	},
	{
		name: 'vs. Scar 4', // https://youtu.be/rQ0fxWnqTj8
		icon: 'speedrunner',
		cards: [
			DiamondSword,
			...Array(8).fill(SpeedrunnerItem),
			Cubfan135Rare,
			Cubfan135Rare,
			...Array(7).fill(BalancedItem),
			Cubfan135Common,
			Cubfan135Common,
			Clock,
			FishingRod,
			SplashPotionOfPoison,
			CurseOfVanishing, // Undetermined book A
			JinglerRare,
			JinglerRare,
			Chest,
			BalancedDoubleItem,
			CurseOfVanishing, // Undetermined book B
			Bow,
			Egg,
			TargetBlock,
			PharaohRare,
			PharaohRare,
			PharaohRare,
			NetheriteArmor,
			TNT,
			Piston,
			Piston,
			TurtleShell,
			SpeedrunnerDoubleItem,
			SpeedrunnerDoubleItem,
		],
	},
]

export function getPharaohDeck(): StarterDeck {
	return PHARAOH_BOSS_DECKS[
		Math.floor(Math.random() * PHARAOH_BOSS_DECKS.length)
	]
}
