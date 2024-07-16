import BuilderCommonItemCard from './builder-common'
import BuilderRareItemCard from './builder-rare'
import BalancedCommonItemCard from './balanced-common'
import BalancedRareItemCard from './balanced-rare'
import RedstoneCommonItemCard from './redstone-common'
import RedstoneRareItemCard from './redstone-rare'
import PranksterCommonItemCard from './prankster-common'
import PranksterRareItemCard from './prankster-rare'
import ExplorerCommonItemCard from './explorer-common'
import ExplorerRareItemCard from './explorer-rare'
import FarmCommonItemCard from './farm-common'
import FarmRareItemCard from './farm-rare'
import PvPCommonItemCard from './pvp-common'
import PvPRareItemCard from './pvp-rare'
import SpeedrunnerCommonItemCard from './speedrunner-common'
import SpeedrunnerRareItemCard from './speedrunner-rare'
import TerraformCommonItemCard from './terraform-common'
import TerraformRareItemCard from './terraform-rare'
import MinerCommonItemCard from './miner-common'
import MinerRareItemCard from './miner-rare'
import Card from '../../base/card'

const itemCardClasses: Array<new () => Card> = [
	BuilderCommonItemCard,
	BuilderRareItemCard,
	BalancedCommonItemCard,
	BalancedRareItemCard,
	RedstoneCommonItemCard,
	RedstoneRareItemCard,
	PranksterCommonItemCard,
	PranksterRareItemCard,
	ExplorerCommonItemCard,
	ExplorerRareItemCard,
	FarmCommonItemCard,
	FarmRareItemCard,
	PvPCommonItemCard,
	PvPRareItemCard,
	SpeedrunnerCommonItemCard,
	SpeedrunnerRareItemCard,
	TerraformCommonItemCard,
	TerraformRareItemCard,
	MinerCommonItemCard,
	MinerRareItemCard,
]

export default itemCardClasses
