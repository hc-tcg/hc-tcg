import Dropper from './dropper'
import SplashPotionOfHarming from './splash-potion-of-harming'
import Brush from './brush'
import Glowstone from './glowstone'
import Lantern from './lantern'
import FletchingTable from './fletching-table'
import Card from '../../base/card'

const singleUseCardClasses: Array<new () => Card> = [
	// Advent calendar cards
	Dropper,
	FletchingTable,
	Brush,
	Glowstone,
	Lantern,
	SplashPotionOfHarming,
]

export default singleUseCardClasses
