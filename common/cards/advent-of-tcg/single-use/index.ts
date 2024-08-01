import Dropper from './dropper'
import SplashPotionOfHarming from './splash-potion-of-harming'
import Brush from './brush'
import Glowstone from './glowstone'
import Lantern from './lantern'
import FletchingTable from './fletching-table'
import {CardClass} from '../../base/card'

const singleUseCardClasses: Array<CardClass> = [
	// Advent calendar cards
	Dropper,
	FletchingTable,
	Brush,
	Glowstone,
	Lantern,
	SplashPotionOfHarming,
]

export default singleUseCardClasses
