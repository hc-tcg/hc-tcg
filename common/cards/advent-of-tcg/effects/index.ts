import CardOld from '../../base/card'
import BerryBush from './berry-bush'
import BrewingStand from './brewing-stand'
import Cat from './cat'
import Furnace from './furnace'
import Slimeball from './slimeball'
import Trapdoor from './trapdoor'

const effectCardClasses: Array<new () => CardOld> = [
	BrewingStand,
	Furnace,
	Slimeball,
	Cat,
	BerryBush,
	Trapdoor,
]

export default effectCardClasses
