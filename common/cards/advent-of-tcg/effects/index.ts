import BrewingStand from './brewing-stand'
import Furnace from './furnace'
import Slimeball from './slimeball'
import Cat from './cat'
import BerryBush from './berry-bush'
import Trapdoor from './trapdoor'
import Card from '../../base/card'

const effectCardClasses: Array<new () => Card> = [
	BrewingStand,
	Furnace,
	Slimeball,
	Cat,
	BerryBush,
	Trapdoor,
]

export default effectCardClasses
