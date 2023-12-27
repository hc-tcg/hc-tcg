import BrewingStandEffectCard from './brewing-stand'
import FurnaceEffectCard from './furnace'
import SlimeballEffectCard from './slimeball'
import CatEffectCard from './cat'
import BerryBushEffectCard from './berry-bush'
import TrapdoorEffectCard from './trapdoor'
import EffectCard from '../../base/effect-card'

const effectCardClasses: Array<EffectCard> = [
	// Advent of TCG cards
	new BrewingStandEffectCard(),
	new FurnaceEffectCard(),
	new SlimeballEffectCard(),
	new CatEffectCard(),
	new BerryBushEffectCard(),
	new TrapdoorEffectCard(),
]

export default effectCardClasses
