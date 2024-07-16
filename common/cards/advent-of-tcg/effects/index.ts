import BrewingStandEffectCard from './brewing-stand'
import FurnaceEffectCard from './furnace'
import SlimeballEffectCard from './slimeball'
import CatEffectCard from './cat'
import BerryBushEffectCard from './berry-bush'
import TrapdoorEffectCard from './trapdoor'
import Card from '../../base/card'

const effectCardClasses: Array<new () => Card> = [
	BrewingStandEffectCard,
	FurnaceEffectCard,
	SlimeballEffectCard,
	CatEffectCard,
	BerryBushEffectCard,
	TrapdoorEffectCard,
]

export default effectCardClasses
