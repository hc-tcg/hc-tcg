import {Card} from '../types'
import BalancedItem from './balanced-common'
import BalancedDoubleItem from './balanced-rare'
import BuilderItem from './builder-common'
import BuilderDoubleItem from './builder-rare'
import ExplorerItem from './explorer-common'
import ExplorerDoubleItem from './explorer-rare'
import FarmItem from './farm-common'
import FarmDoubleItem from './farm-rare'
import MinerItem from './miner-common'
import MinerDoubleItem from './miner-rare'
import PranksterItem from './prankster-common'
import PranksterDoubleItem from './prankster-rare'
import PvPItem from './pvp-common'
import PvPDoubleItem from './pvp-rare'
import RedstoneItem from './redstone-common'
import RedstoneDoubleItem from './redstone-rare'
import SpeedrunnerItem from './speedrunner-common'
import SpeedrunnerDoubleItem from './speedrunner-rare'
import TerraformItem from './terraform-common'
import TerraformDoubleItem from './terraform-rare'
import WildItem from './wild-common'

const itemCardClasses: Array<Card> = [
	BuilderItem,
	BuilderDoubleItem,
	BalancedItem,
	BalancedDoubleItem,
	RedstoneItem,
	RedstoneDoubleItem,
	PranksterItem,
	PranksterDoubleItem,
	ExplorerItem,
	ExplorerDoubleItem,
	FarmItem,
	FarmDoubleItem,
	PvPItem,
	PvPDoubleItem,
	SpeedrunnerItem,
	SpeedrunnerDoubleItem,
	TerraformItem,
	TerraformDoubleItem,
	MinerItem,
	MinerDoubleItem,
	WildItem,
]

export default itemCardClasses
