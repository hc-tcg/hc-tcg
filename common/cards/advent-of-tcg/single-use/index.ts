import CardOld from '../../base/card'
import Brush from './brush'
import Dropper from './dropper'
import FletchingTable from './fletching-table'
import Glowstone from './glowstone'
import Lantern from './lantern'
import SplashPotionOfHarming from './splash-potion-of-harming'

const singleUseCardClasses: Array<new () => CardOld> = [
	// Advent calendar cards
	Dropper,
	FletchingTable,
	Brush,
	Glowstone,
	Lantern,
	SplashPotionOfHarming,
]

export default singleUseCardClasses
