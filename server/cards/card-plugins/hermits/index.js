import BdoubleO100RareHermitCard from './bdoubleo100-rare'
import Cubfan135RareHermitCard from './cubfan135-rare'
import Docm77RareHermitCard from './docm77-rare'
import EthosLabRareHermitCard from './ethoslab-rare'
import EthosLabUltraRareHermitCard from './ethoslab-ultra-rare'
import FalseSymmetryRareHermitCard from './falsesymmetry-rare'
import GeminiTayRareHermitCard from './geminitay-rare'
import GrianRareHermitCard from './grian-rare'
import GoodTimesWithScarRareHermitCard from './goodtimeswithscar-rare'
import HypnotizdRareHermitCard from './hypnotizd-rare'

function registerCards(game) {
	new BdoubleO100RareHermitCard().register(game)
	new Cubfan135RareHermitCard().register(game)
	new Docm77RareHermitCard().register(game)
	new EthosLabRareHermitCard().register(game)
	new EthosLabUltraRareHermitCard().register(game)
	new FalseSymmetryRareHermitCard().register(game)
	new GeminiTayRareHermitCard().register(game)
	new GrianRareHermitCard().register(game)
	new GoodTimesWithScarRareHermitCard().register(game)
	new HypnotizdRareHermitCard().register(game)
}

export default registerCards
