import DropperSingleUseCard from './dropper'
import SplashPotionOfHarmingSingleUseCard from './splash-potion-of-harming'
import BrushSingleUseCard from './brush'
import GlowstoneSingleUseCard from './glowstone'
import LanternSingleUseCard from './lantern'
import FletchingTableSingleUseCard from './fletching-table'
import Card from '../../base/card'

const singleUseCardClasses: Array<new () => Card> = [
	// Advent calendar cards
	DropperSingleUseCard,
	FletchingTableSingleUseCard,
	BrushSingleUseCard,
	GlowstoneSingleUseCard,
	LanternSingleUseCard,
	SplashPotionOfHarmingSingleUseCard,
]

export default singleUseCardClasses
