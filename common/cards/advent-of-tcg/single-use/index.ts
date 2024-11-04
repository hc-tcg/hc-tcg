import {Card} from '../../types'
import Brush from './brush'
import Dropper from './dropper'
import Feather from './feather'
import FletchingTable from './fletching-table'
import Glowstone from './glowstone'
import Lantern from './lantern'
import SplashPotionOfHarming from './splash-potion-of-harming'

const singleUseCardClasses: Array<Card> = [
	// Advent calendar cards
	Dropper,
	Feather,
	FletchingTable,
	Brush,
	Glowstone,
	Lantern,
	SplashPotionOfHarming,
]

export default singleUseCardClasses
