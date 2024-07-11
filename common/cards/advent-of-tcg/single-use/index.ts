import DropperSingleUseCard from './dropper'
import SplashPotionOfHarmingSingleUseCard from './splash-potion-of-harming'
import BrushSingleUseCard from './brush'
import GlowstoneSingleUseCard from './glowstone'
import LanternSingleUseCard from './lantern'
import FletchingTableSingleUseCard from './fletching-table'
import Card from '../../base/card'

const singleUseCardClasses: Array<Card> = [
	// Advent calendar cards
	new DropperSingleUseCard(),
	new FletchingTableSingleUseCard(),
	new BrushSingleUseCard(),
	new GlowstoneSingleUseCard(),
	new LanternSingleUseCard(),
	new SplashPotionOfHarmingSingleUseCard(),
]

export default singleUseCardClasses
